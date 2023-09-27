import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderEntity } from '../entities/order.entity';
import { OrderProductsEntity } from '../entities/order-product.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { AuditService } from 'src/audit/audit.services';
import { ShippingEntity } from '../entities/shipping.entity';
import { ProductsService } from 'src/products/services/products.service';
import { OrderProductDto } from '../dto/order-product.dto';
import { OrderStatus } from 'src/utils/common/order.enum';
import { UpdateOrderStatus } from '../dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly entityManager: EntityManager,
    private readonly auditService: AuditService,
    private readonly productServices: ProductsService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, user: UserEntity) {
    const shippingEntity = new ShippingEntity();
    shippingEntity.phone = createOrderDto.shippingAddress.phone;
    shippingEntity.name = createOrderDto.shippingAddress.name;
    shippingEntity.address = createOrderDto.shippingAddress.address;
    shippingEntity.city = createOrderDto.shippingAddress.city;

    const order = new OrderEntity();
    order.user = user;
    order.shippingAddress = shippingEntity;
    order.shippedAt = null;
    order.products = [];

    const orderProducts: OrderProductDto[] = createOrderDto.orderProducts;
    let totalOrderPrice = 0;

    for (const productDto of orderProducts) {
      const product = await this.findProductById(productDto.productId);

      const orderProduct = new OrderProductsEntity();
      orderProduct.order_quantity = productDto.order_quantity;
      orderProduct.product = product;
      const productPrice = product.price;
      const priceTotal = productPrice * orderProduct.order_quantity;
      totalOrderPrice += priceTotal;
      order.products.push(orderProduct);
    }

    order.total_price = totalOrderPrice;
    try {
      await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.save(ShippingEntity, shippingEntity);
          await transactionalEntityManager.save(OrderEntity, order);
        },
      );
      this.auditService.logOrderPlacement(user.id, order.id);
      const savedOrder = await this.findOne(order.id);

      return { savedOrder, totalPrice: order.total_price };
    } catch (error) {
      this.auditService.failedOrder(user.id, order.id, error, error.stack);

      throw new InternalServerErrorException(
        'Failed to create the order',
        error.message,
      );
    }
  }

  async findProductById(id: number) {
    const product = this.productServices.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }

  async findAll(): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      relations: ['shippingAddress', 'user', 'products'],
    });
  }

  async findOne(id: number): Promise<OrderEntity | undefined> {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .leftJoinAndSelect('order.user', 'user')
      .addSelect(['user.username', 'user.email'])
      .leftJoinAndSelect('order.products', 'products')
      .leftJoin('products.product', 'product')
      .addSelect(['product.id', 'product.title', 'product.price'])
      .where('order.id = :id', { id })
      .getOne();
  }
  async updateOrderStatus(
    id: number,
    updateOrderDto: UpdateOrderStatus,
    user: UserEntity,
  ) {
    try {
      const order = await this.findOne(id);

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found.`);
      }

      if (
        order.status === OrderStatus.DELIVERED ||
        order.status === OrderStatus.CANCELLED
      ) {
        throw new BadRequestException(`Order is already ${order.status}`);
      }

      if (
        order.status === OrderStatus.PROCESSING &&
        updateOrderDto.status !== OrderStatus.SHIPPED
      ) {
        throw new BadRequestException(
          `Cannot mark as Shipped before Processing.`,
        );
      }

      if (updateOrderDto.status === OrderStatus.SHIPPED) {
        order.shippedAt = new Date();
      }

      if (updateOrderDto.status === OrderStatus.DELIVERED) {
        order.orderAt = new Date();
      }

      order.status = updateOrderDto.status;
      order.updatedBy = user;

      await this.orderRepository.save(order);

      if (updateOrderDto.status === OrderStatus.DELIVERED) {
        await this.updateProductStock(order, OrderStatus.DELIVERED);
      }

      return order;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update order status',
        error.message,
      );
    }
  }

  async updateProductStock(order: OrderEntity, status: OrderStatus) {
    try {
      for (const op of order.products) {
        await this.productServices.updateStock(
          op.product.id,
          op.order_quantity,
          status,
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update product stock',
        error.message,
      );
    }
  }

  async cancelOrder(id: number, user: UserEntity) {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order Not Found with id : ${id}`);
    }

    if (order.status === OrderStatus.CANCELLED) {
      return order;
    }

    order.updatedBy = user;
    order.status = OrderStatus.CANCELLED;

    await this.orderRepository.save(order);
    await this.updateProductStock(order, OrderStatus.CANCELLED);

    return order;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}

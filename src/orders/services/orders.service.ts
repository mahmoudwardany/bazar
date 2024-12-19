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
    private readonly entityManager: EntityManager,
    private readonly auditService: AuditService,
    private readonly productServices: ProductsService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, user: UserEntity) {
    const shippingEntity = await this.createShippingEntity(
      createOrderDto.shippingAddress,
    );
    const order = new OrderEntity();
    order.user = user;
    order.shippingAddress = shippingEntity;
    order.shippedAt = null;
    order.products = [];

    const totalOrderPrice = this.calculateTotalPrice(
      createOrderDto.orderProducts,
    );

    try {
      await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.save(ShippingEntity, shippingEntity);
          await transactionalEntityManager.save(OrderEntity, order);
        },
      );

      this.auditService.logOrderPlacement(user.id, order.id);
      const savedOrder = await this.findOne(order.id);
      return { savedOrder, totalPrice: totalOrderPrice };
    } catch (error) {
      this.auditService.failedOrder(user.id, order.id, error, error.stack);
      throw new InternalServerErrorException(
        'Failed to create the order',
        error.message,
      );
    }
  }

  async findAll(): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      relations: ['shippingAddress', 'user', 'products'],
    });
  }

  async findOne(id: number): Promise<OrderEntity> {
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
    const order = await this.findOne(id);

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    this.validateOrderStatusUpdate(order, updateOrderDto);

    order.status = updateOrderDto.status;
    order.updatedBy = user;

    if (updateOrderDto.status === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();
    }

    if (updateOrderDto.status === OrderStatus.DELIVERED) {
      order.orderAt = new Date();
      await this.updateProductStock(order, OrderStatus.DELIVERED);
    }

    await this.orderRepository.save(order);
    return order;
  }

  private async updateProductStock(order: OrderEntity, status: OrderStatus) {
    for (const op of order.products) {
      await this.productServices.updateStock(
        op.product.id,
        op.order_quantity,
        status,
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

  //helper
  async findAllProductById(id: number) {
    const product = await this.productServices.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product Not Found with id : ${id}`);
    }
    return product;
  }

  private async calculateTotalPrice(
    orderProducts: OrderProductDto[],
  ): Promise<number> {
    let total = 0;

    for (const productDto of orderProducts) {
      const product = await this.productServices.findOne(productDto.productId);
      total += productDto.order_quantity * product.price;
    }

    return total;
  }

  private validateOrderStatusUpdate(
    order: OrderEntity,
    updateOrderDto: UpdateOrderStatus,
  ) {
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
  }

  async findProductById(id: number) {
    const product = this.productServices.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }

  private async createShippingEntity(shippingAddress) {
    const shippingEntity = new ShippingEntity();
    shippingEntity.phone = shippingAddress.phone;
    shippingEntity.name = shippingAddress.name;
    shippingEntity.address = shippingAddress.address;
    shippingEntity.city = shippingAddress.city;
    return shippingEntity;
  }
}

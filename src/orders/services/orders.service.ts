import {
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

  async createOrder(
    createOrderDto: CreateOrderDto,
    user: UserEntity,
  ): Promise<OrderEntity> {
    try {
      const shippingEntity = new ShippingEntity(); // Create a new ShippingEntity instance
      shippingEntity.phone = createOrderDto.shippingAddress.phone;
      shippingEntity.name = createOrderDto.shippingAddress.name;
      shippingEntity.address = createOrderDto.shippingAddress.address;
      shippingEntity.city = createOrderDto.shippingAddress.city;

      const order = new OrderEntity();
      order.user = user;
      order.shippingAddress = shippingEntity;
      order.products = [];

      const orderProducts: OrderProductDto[] = createOrderDto.orderProducts;
      let totalOrderPrice = 0;

      for (const productDto of orderProducts) {
        const product = await this.findProductById(productDto.productId);

        const orderProduct = new OrderProductsEntity();
        orderProduct.order_quantity = productDto.order_quantity;
        orderProduct.productId = product.id;
        const productPrice = product.price;
        const priceTotal = productPrice * orderProduct.order_quantity;
        totalOrderPrice += priceTotal;
        order.products.push(orderProduct);
      }

      order.total_price = totalOrderPrice;

      await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.save(ShippingEntity, shippingEntity);
          await transactionalEntityManager.save(OrderEntity, order);
        },
      );
      this.auditService.logOrderPlacement(user.id, order.id);

      return order;
    } catch (error) {
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
      .leftJoinAndSelect('order.products', 'products')
      .where('order.id = :id', { id })
      .getOne();
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}

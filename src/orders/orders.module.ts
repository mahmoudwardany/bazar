import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderEntity } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingEntity } from './entities/shipping.entity';
import { OrderProductsEntity } from './entities/order-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      ShippingEntity,
      OrderProductsEntity,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}

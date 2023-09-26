import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controller/orders.controller';
import { OrderEntity } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingEntity } from './entities/shipping.entity';
import { OrderProductsEntity } from './entities/order-product.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { AuditService } from 'src/audit/audit.services';
import { AuditModule } from 'src/audit/audit.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      ShippingEntity,
      OrderProductsEntity,
      ProductEntity,
    ]),
    ProductsModule,
    forwardRef(() => AuditModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, AuditService],
})
export class OrdersModule {}

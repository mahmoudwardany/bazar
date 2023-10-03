import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmCOnfig } from './config/DB.config';
import { CurrentUserMiddleware } from './utils/middleware/currentUser.middleware';
import * as cloudinary from 'cloudinary';
import { AuditModule } from './audit/audit.module';
import { CompressionMiddleware } from './utils/middleware/compression.middleware';
import { ThrottlerModule } from '@nestjs/throttler';
@Module({
  imports: [
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    TypeOrmModule.forRoot(typeOrmCOnfig),
      ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuditModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
  ],
  providers: [ConfigService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware, CompressionMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    cloudinary.v2.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }
}

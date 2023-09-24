import { Module, forwardRef } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controller/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { CategoriesEntity } from '../categories/entities/category.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CategoriesModule } from '../categories/categories.module';
import { UsersModule } from '../users/users.module';
import { multerConfig } from 'src/utils/middleware/multer';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, CategoriesEntity, UserEntity]),
    forwardRef(() => CategoriesModule),
    forwardRef(() => UsersModule),
    MulterModule.register(multerConfig),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

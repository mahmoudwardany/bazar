import { Module, forwardRef } from '@nestjs/common';
import { CategoriesService } from './services/categories.service';
import { CategoriesController } from './controller/categories.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesEntity } from './entities/category.entity';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'src/utils/middleware/multer';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([CategoriesEntity]),
    MulterModule.register(multerConfig),
    forwardRef(() => ProductsModule),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import * as cloudinary from 'cloudinary';
import { ProductEntity } from '../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesEntity } from 'src/categories/entities/category.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrderStatus } from 'src/utils/common/order.enum';
import { CategoriesService } from 'src/categories/services/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly categoriesService: CategoriesService,
  ) {}
  async createProduct(
    createProductDto: CreateProductDto,
    productImage: Express.Multer.File,
    currentUser: UserEntity,
  ) {
    try {
      const category = await this.categoriesService.findCategoryById(
        +createProductDto.categoryId,
      );

      const { secure_url, public_id } = await this.uploadProductImage(
        productImage,
      );

      const newProduct = this.createProductEntity(
        createProductDto,
        category,
        currentUser,
        secure_url,
        public_id,
      );

      return await this.saveProduct(newProduct);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create product',
        error.message,
      );
    }
  }

  private async uploadProductImage(imageFile: Express.Multer.File) {
    try {
      const uploadedImage = await cloudinary.v2.uploader.upload(
        imageFile.path,
        {
          folder: 'product_images',
        },
      );

      return uploadedImage;
    } catch (error) {
      throw new Error('Error uploading image to Cloudinary');
    }
  }

  private createProductEntity(
    createProductDto: CreateProductDto,
    category: CategoriesEntity,
    currentUser: UserEntity,
    productImageUrl: string,
    imagePublicId: string,
  ): ProductEntity {
    return this.productRepository.create({
      title: createProductDto.title,
      description: createProductDto.description,
      price: createProductDto.price,
      stock: createProductDto.stock,
      category,
      createdBy: currentUser,
      productImage: productImageUrl,
      imagePublicId,
    });
  }

  async saveProduct(product: ProductEntity) {
    return await this.productRepository.save(product);
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { createdBy: true, category: true },
    });

    if (!product) {
      throw new NotFoundException('Product Not Found');
    }

    return product;
  }

  async findAll(page = 1, limit = 10): Promise<ProductEntity[]> {
    const skip = (page - 1) * limit;
    return await this.productRepository.find({
      skip,
      take: limit,
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (updateProductDto.categoryId) {
      const category = await this.categoriesService.findCategoryById(
        updateProductDto.categoryId,
      );
      product.category = category; // تحديث الفئة
    }

    Object.keys(updateProductDto).forEach((key) => {
      if (key !== 'categoryId' && updateProductDto[key] !== undefined) {
        product[key] = updateProductDto[key];
      }
    });

    return this.productRepository.save(product);
  }

  async delete(id: number) {
    const product = await this.findOne(id);
    if (product.imagePublicId) {
      await cloudinary.v2.uploader.destroy(product.imagePublicId);
    }
    await this.productRepository.remove(product);
    return {
      message: `Product Deleted Sucessfully with Id : ${id}`,
    };
  }

  async updateStock(id: number, stockChange: number, status: string) {
    try {
      const product = await this.findOne(id);

      const stockAdjustment =
        status === OrderStatus.DELIVERED ? -stockChange : stockChange;

      if (product.stock + stockAdjustment < 0) {
        throw new BadRequestException('Insufficient stock available');
      }

      product.stock += stockAdjustment;

      return await this.productRepository.save(product);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update product stock',
        error.message,
      );
    }
  }

  async findByCategoryId(categoryId: number): Promise<ProductEntity[]> {
    return this.productRepository.find({
      where: { categoryId },
    });
  }

  async updateProductsByCategoryId(
    categoryId: number,
    category: CategoriesEntity,
  ): Promise<void> {
    const productsToUpdate = await this.findByCategoryId(categoryId);

    if (productsToUpdate.length === 0) {
      throw new NotFoundException('No products found for this category');
    }

    productsToUpdate.forEach((product) => {
      product.category = category; // Set the new category
    });

    await this.productRepository.save(productsToUpdate);
  }

  async removeCategoryFromProductsByCategoryId(
    categoryId: number,
  ): Promise<void> {
    const productsToUpdate = await this.productRepository.find({
      where: { categoryId },
    });

    if (productsToUpdate.length === 0) {
      throw new NotFoundException('No products found for this category');
    }

    productsToUpdate.forEach((product) => {
      product.categoryId = null;
    });

    await this.productRepository.save(productsToUpdate);
  }
}

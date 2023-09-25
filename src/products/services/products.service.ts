import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import * as cloudinary from 'cloudinary';
import { ProductEntity } from '../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesEntity } from 'src/categories/entities/category.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoriesEntity)
    private readonly categoriesRepository: Repository<CategoriesEntity>,
  ) {}
  async createProduct(
    createProductDto: CreateProductDto,
    productImage: Express.Multer.File,
    currentUser: UserEntity,
  ) {
    try {
      const categoryId = +createProductDto.categoryId;
      const category = await this.findCategoryById(categoryId);
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
      return error;
    }
  }

  private async findCategoryById(categoryId: number) {
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    return category;
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
  ) {
    const newProduct = new ProductEntity();
    newProduct.title = createProductDto.title;
    newProduct.description = createProductDto.description;
    newProduct.price = createProductDto.price;
    newProduct.stock = createProductDto.stock;
    newProduct.category = category;
    newProduct.createdBy = currentUser;
    newProduct.productImage = productImageUrl;
    newProduct.imagePublicId = imagePublicId;
    return newProduct;
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

  async findAll(page?: number, limit?: number): Promise<ProductEntity[]> {
    if (page && limit) {
      const skip = (page - 1) * limit;
      return await this.productRepository.find({
        skip: skip,
        take: limit,
      });
    } else {
      return await this.productRepository.find();
    }
  }
  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    for (const key in updateProductDto) {
      if (
        updateProductDto.hasOwnProperty(key) &&
        updateProductDto[key] !== undefined
      ) {
        if (key === 'categoryId') {
          const category = await this.findCategoryById(updateProductDto[key]);
          product.category = category;
        } else {
          product[key] = updateProductDto[key];
        }
      }
    }
    return await this.productRepository.save(product);
  }
  async delete(id: number) {
    const product = await this.findOne(id);
    if (product.imagePublicId) {
      await cloudinary.v2.uploader.destroy(product.imagePublicId);
    }
    const deletedProduct = await this.productRepository.remove(product);
    return {
      message: `Product Deleted Sucessfully with Id : ${id}`,
      product: deletedProduct,
    };
  }
}

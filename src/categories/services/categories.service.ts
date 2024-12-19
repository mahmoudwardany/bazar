import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesEntity } from '../entities/category.entity';
import * as cloudinary from 'cloudinary';
import { ProductsService } from '../../products/services/products.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoriesEntity)
    private readonly categoriesRepository: Repository<CategoriesEntity>,
    private readonly productService: ProductsService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    imageFile: Express.Multer.File,
  ) {
    const uploadedImage = await this.uploadImage(imageFile);
    const newCategory = this.categoriesRepository.create({
      ...createCategoryDto,
      imageUrl: uploadedImage.public_id,
    });
    return await this.categoriesRepository.save(newCategory);
  }

  async uploadImage(imageFile: Express.Multer.File) {
    try {
      const uploadedImage = await cloudinary.v2.uploader.upload(
        imageFile.path,
        {
          folder: 'category_images',
        },
      );
      return uploadedImage;
    } catch (error) {
      throw new HttpException(
        'Error uploading image to Cloudinary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    return await this.categoriesRepository.find();
  }

  async findCategoryById(id: number) {
    const category = await this.categoriesRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category Not Found with id:${id} `);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findCategoryById(id);

    category.title = updateCategoryDto.title;

    await this.categoriesRepository.save(category);

    await this.productService.updateProductsByCategoryId(category.id, category);

    return category;
  }

  async removeCategory(id: number) {
    const category = await this.findCategoryById(id);

    await this.productService.removeCategoryFromProductsByCategoryId(
      category.id,
    );

    return await this.categoriesRepository.remove(category);
  }
}

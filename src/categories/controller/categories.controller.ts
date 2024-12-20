import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthorizedGuard } from 'src/utils/guard/authorized-role.guard';
import { Roles } from 'src/utils/common/Roles.enum';
import { AuthenticationGuard } from 'src/utils/guard/auth.guard';
import { CacheTTL } from '@nestjs/cache-manager';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(AuthenticationGuard, AuthorizedGuard([Roles.ADMIN]))
  @Post()
  @UseInterceptors(FileInterceptor('imageUrl'))
  async createCategoryWithImage(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() imageUrl: Express.Multer.File,
  ) {
    return this.categoriesService.create(createCategoryDto, imageUrl);
  }

  @Get()
  @CacheTTL(86400000)
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findCategoryById(+id);
  }
  @UseGuards(AuthenticationGuard, AuthorizedGuard([Roles.ADMIN]))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const updatedCategory = await this.categoriesService.update(
      +id,
      updateCategoryDto,
    );
    return updatedCategory;
  }

  @UseGuards(AuthenticationGuard, AuthorizedGuard([Roles.ADMIN]))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.removeCategory(+id);
  }
}

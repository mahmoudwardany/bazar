/* eslint-disable prettier/prettier */
import {
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsPositive,
    IsString,
    MaxLength,
    MinLength,
  } from 'class-validator';
  
  export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    title: string;
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(200)
    description: string;
    @IsNumberString()
    @IsNotEmpty()
    price: number;
    @IsNumberString()
    @IsNotEmpty()
    stock: number;
    @IsNumberString()
    @IsNotEmpty()
    categoryId: number;
  }
  
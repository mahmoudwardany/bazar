/* eslint-disable prettier/prettier */
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
  } from 'class-validator';
  export class LoginUserDto {
    @IsString({ message: 'email must be string' })
    @IsNotEmpty({ message: 'email is required' })
    @IsEmail({}, { message: 'Invalid email' })
    email: string;
    @IsString({ message: 'password must be string' })
    @IsNotEmpty({ message: 'password is required' })
    @MinLength(3, { message: 'Min Length is 3' })
    @MaxLength(20, { message: 'Max Length is 20' })
    password: string;
  }
  
/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShippingDto {
    @IsNotEmpty()
    @IsString()
        phone:string
    @IsOptional()
    @IsString()
        name:string
    @IsNotEmpty()
    @IsString()  
        address: string;
    @IsNotEmpty()
    @IsString()
        city:string
}

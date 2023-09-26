/* eslint-disable prettier/prettier */
import { ValidateNested } from "class-validator";
import { CreateShippingDto } from "./shipping.dto";
import {Type} from 'class-transformer'
import { OrderProductDto } from "./order-product.dto";
export class CreateOrderDto {
    @Type(()=>CreateShippingDto)
    @ValidateNested()
    shippingAddress:CreateShippingDto
    @Type(()=>OrderProductDto)
    @ValidateNested()
    orderProducts:OrderProductDto[]

}

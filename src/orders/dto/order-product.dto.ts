import { IsNumber, IsPositive } from 'class-validator';
export class OrderProductDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  order_quantity: number;

  @IsNumber()
  @IsPositive()
  productId: number;
}

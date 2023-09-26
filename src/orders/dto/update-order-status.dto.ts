/* eslint-disable prettier/prettier */
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { OrderStatus } from 'src/utils/common/order.enum';

export class UpdateOrderStatus {
  @IsNotEmpty()
  @IsString()
  @IsIn([OrderStatus.SHIPPED,OrderStatus.DELIVERED])
  status: OrderStatus;
}

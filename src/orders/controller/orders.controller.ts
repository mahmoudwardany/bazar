import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { AuthenticationGuard } from 'src/utils/guard/auth.guard';
import { CurrentUser } from 'src/utils/decorators/currentUser.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthorizedGuard } from 'src/utils/guard/authorized-role.guard';
import { Roles } from 'src/utils/common/Roles.enum';
import { UpdateOrderStatus } from '../dto/update-order-status.dto';
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthenticationGuard)
  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const order = await this.ordersService.createOrder(
      createOrderDto,
      currentUser,
    );
    return order;
  }

  @Get()
  @UseGuards(AuthenticationGuard, AuthorizedGuard([Roles.ADMIN]))
  async findAllOrders() {
    return await this.ordersService.findAll();
  }
  @UseGuards(AuthenticationGuard, AuthorizedGuard([Roles.ADMIN]))
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.ordersService.findOne(+id);
  }
  @UseGuards(AuthenticationGuard, AuthorizedGuard([Roles.ADMIN]))
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderStatus,
    @CurrentUser() user: UserEntity,
  ) {
    return await this.ordersService.updateOrderStatus(
      +id,
      updateOrderDto,
      user,
    );
  }
  @UseGuards(AuthenticationGuard, AuthorizedGuard([Roles.ADMIN]))
  @Put('cancel/:id')
  async cancel(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return await this.ordersService.cancelOrder(+id, user);
  }
}

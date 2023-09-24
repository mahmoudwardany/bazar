import { UserEntity } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { ShippingEntity } from './shipping.entity';
import { OrderStatus } from 'src/utils/common/order.enum';
import { OrderProductsEntity } from './order-product.entity';

@Entity({ name: 'order' })
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn()
  orderAt: Timestamp;
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PROCCESSING })
  status: string;
  @Column({ nullable: true })
  shippedAt: Date;
  @Column({ nullable: true })
  deliveredAt: Date;
  @ManyToOne(() => UserEntity, (user) => user.order)
  updatedBy: UserEntity;
  @OneToOne(() => ShippingEntity, (shipping) => shipping.address)
  @JoinColumn()
  shippingAddress: ShippingEntity;
  @OneToMany(() => OrderProductsEntity, (ord) => ord.order, { cascade: true })
  products: OrderProductsEntity[];
}

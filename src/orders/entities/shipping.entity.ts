/* eslint-disable prettier/prettier */
// shipping.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity({ name: 'shipping' })
export class ShippingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phone: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  city: string;
  @OneToOne(() => OrderEntity, (order) => order.shippingAddress)
  @JoinColumn()
  order: OrderEntity;
}

/* eslint-disable prettier/prettier */
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity({ name: 'shipping' })
export class ShippingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phone: number;

  @Column()
  address: string;

  @Column()
  city: string;

  @OneToOne(() => OrderEntity, (order) => order.shippingAddress)
  order: OrderEntity; 
}


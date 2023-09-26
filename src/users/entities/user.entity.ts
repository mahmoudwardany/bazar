import { Exclude } from 'class-transformer';
import { CategoriesEntity } from 'src/categories/entities/category.entity';
import { OrderEntity } from 'src/orders/entities/order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { Roles } from 'src/utils/common/Roles.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  username: string;
  @Column({ unique: true })
  email: string;
  @Column()
  @Exclude()
  password: string;
  @Column({ type: 'enum', enum: Roles, array: true, default: [Roles.USER] })
  roles: Roles[];
  @CreateDateColumn()
  createdAt: Timestamp;
  products: ProductEntity[];
  @OneToMany(() => CategoriesEntity, (cat) => cat.createdBy)
  category: CategoriesEntity[];
  @OneToMany(() => OrderEntity, (order) => order.updatedBy)
  orderUpdatedBy: OrderEntity;
  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];
}

import { CategoriesEntity } from 'src/categories/entities/category.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'Product' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  description: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;
  @Column()
  stock: number;
  @Column({ nullable: true })
  productImage: string;
  @Column({ nullable: true })
  imagePublicId: string;
  @CreateDateColumn()
  createdAt: Timestamp;
  @UpdateDateColumn()
  updatedAt: Timestamp;
  @ManyToOne(() => UserEntity, (user) => user.products)
  createdBy: UserEntity;
  @ManyToOne(() => CategoriesEntity, (cat) => cat.products)
  category: CategoriesEntity;
  @Column({ default: 2 })
  userId: number;
  @Column({ nullable: true })
  categoryId: number;
}

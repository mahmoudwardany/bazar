/* eslint-disable prettier/prettier */
import { ProductEntity } from "src/products/entities/product.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";

@Entity({ name: 'orders-product' })
export class OrderProductsEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column()
    order_quantity:number
    @ManyToOne(()=>OrderEntity,(order)=>order.products)
    order:OrderEntity;
    @ManyToOne(()=>ProductEntity,(prod)=>prod.products,{cascade:true})
    product:ProductEntity
}

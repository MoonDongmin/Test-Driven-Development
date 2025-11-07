import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  dataKey: number;

  @Column({unique: true})
  id: string;

  @Column()
  sellerId: string;

  @Column()
  name: string;

  @Column()
  imageUri: string;

  @Column()
  description: string;

  @Column({type: "bigint"})
  priceAmount: bigint;

  @Column()
  stockQuantity: number;
}

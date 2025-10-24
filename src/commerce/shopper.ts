import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Shopper {
  @PrimaryGeneratedColumn()
  dataKey: number;

  @Column({unique: true})
  id: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    unique: true,
  })
  username: string;

  @Column({length: 1000})
  hashedPassword: string;
}

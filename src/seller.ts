import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Seller {
    @PrimaryGeneratedColumn()
    dataKey: number;

    @Column({unique: true})
    email: string;

    @Column({unique: true})
    username: string;

    @Column({
        length: 1000,
    })
    password: string;
}

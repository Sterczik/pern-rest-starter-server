import * as bcrypt from "bcryptjs";
import { Length } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum Roles {
    user,
    admin
}

@Entity("users")
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        length: 255,
        unique: true
    })
    email: string;

    @Column({
        type: "varchar"
    })
    @Length(6, 20)
    password: string;

    @Column({
        type: "varchar"
    })
    @Length(3, 50)
    name: string;

    @Column({
        default: Roles.user
    })
    role: Roles;

    @Column({
        type: "text"
    })
    picture: string;

    @Column({
        type: "integer",
        default: 1
    })
    service: number;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @BeforeInsert()
    async hashPasswordBeforeInsert() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}
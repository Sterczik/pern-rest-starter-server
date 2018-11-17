import * as bcrypt from "bcryptjs";
import { Length } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { compareSync } from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { jwtSecret, jwtExpirationMinutes } from '../../config/variables';
import { Todo } from './Todo';

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
    @Length(6, 30)
    password: string;

    @Column({
        type: "varchar"
    })
    @Length(3, 30)
    name: string;

    @Column({
        default: Roles.user
    })
    role: Roles;

    @Column({
        type: "text",
        default: null
    })
    picture: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @OneToMany(type => Todo, todo => todo.user)
    todos: Todo[];

    @BeforeInsert()
    async hashPasswordBeforeInsert() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    // Methods

    public authenticateUser(password: string) {
        return compareSync(password, this.password);
    }

    public createToken() {
        return jwt.sign({ id: this.id }, jwtSecret, { expiresIn: Number(jwtExpirationMinutes) * 60 });
    }

    public toAuthJSON() {
        return {
            id: this.id,
            token: `JWT ${this.createToken()}`,
        };
    }

    public toJSON() {
        return {
            id: this.id,
            name: this.name,
        };
    }
}
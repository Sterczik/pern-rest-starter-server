import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { registerSchema } from 'class-validator';
import { User } from './User';
import { TodoValidationSchema } from '../validations/Todo/TodoSchema';

registerSchema(TodoValidationSchema);

@Entity("todos")
export class Todo extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 255 })
  name: string;

  @Column({ type: "bool", default: false })
  isDone: boolean;

  @ManyToOne(type => User, user => user.todos)
  user: User;
}
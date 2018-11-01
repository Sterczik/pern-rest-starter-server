import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity("todos")
export class Todo extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 255 })
  name: string;

}
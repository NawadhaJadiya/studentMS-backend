import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  user_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
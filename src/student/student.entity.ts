import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  rollno: string;

  @Column()
  password: string;

  @Column()
  class: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 15 })
  phone: string;

  @Column({nullable: true})
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;
  
  @Column({ type: 'json', nullable: true }) 
  marks: any;

  @Column({ type: 'json', nullable: true })
  previousMarks: {
    class: string;
    marks: Record<string, number>;
    year?: number;
  }[];


  
}

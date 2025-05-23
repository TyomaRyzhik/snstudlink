import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Course } from './Course';

@Entity()
export class Lecture {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ nullable: true })
  videoUrl?: string;

  @Column({ nullable: true })
  slidesUrl?: string;

  @Column({ type: 'int' })
  order!: number;

  @ManyToOne(() => Course, course => course.lectures)
  course!: Course;

  @Column()
  courseId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 
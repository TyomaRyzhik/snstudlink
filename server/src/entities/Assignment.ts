import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Course } from './Course';

export enum AssignmentType {
  HOMEWORK = 'homework',
  QUIZ = 'quiz',
  PROJECT = 'project',
  EXAM = 'exam'
}

export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed'
}

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: AssignmentType,
    default: AssignmentType.HOMEWORK
  })
  type!: AssignmentType;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.DRAFT
  })
  status!: AssignmentStatus;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({ type: 'int', nullable: true })
  maxScore?: number;

  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @Column({ type: 'text', nullable: true })
  submissionInstructions?: string;

  @ManyToOne(() => Course, course => course.assignments)
  course!: Course;

  @Column()
  courseId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 
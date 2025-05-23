import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Course } from './Course';

export enum CourseRole {
  TEACHER = 'teacher',
  STUDENT = 'student',
}

@Entity()
export class CourseParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: CourseRole, default: CourseRole.STUDENT })
  role!: CourseRole;

  @ManyToOne(() => User, user => user.courseParticipants)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string; // Explicit column for the User relation

  @ManyToOne(() => Course, course => course.participants)
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column()
  courseId!: string; // Explicit column for the Course relation
} 
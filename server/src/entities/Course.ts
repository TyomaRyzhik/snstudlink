import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CourseParticipant } from './CourseParticipant';
import { Lecture } from './Lecture';
import { Assignment } from './Assignment';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => CourseParticipant, participant => participant.course)
  participants!: CourseParticipant[];

  @OneToMany(() => Lecture, lecture => lecture.course)
  lectures!: Lecture[];

  @OneToMany(() => Assignment, assignment => assignment.course)
  assignments!: Assignment[];
} 
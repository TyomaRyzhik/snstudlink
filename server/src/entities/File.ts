import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Lesson } from './Lesson';
import { User } from './User';

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @ManyToOne(() => Lesson, lesson => lesson.files)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column()
  lesson_id: number;

  @ManyToOne(() => User, user => user.uploadedFiles)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @Column()
  uploaded_by: string;
} 
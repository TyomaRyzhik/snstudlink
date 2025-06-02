import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Subject } from './Subject';
import { File } from './File';
// We will add a relationship to a File entity later
// import { File } from './File';

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Subject, subject => subject.lessons)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column()
  subject_id: number;

  @OneToMany(() => File, file => file.lesson)
  files: File[];

  // Relationship to files will be added here later
  // @OneToMany(() => File, file => file.lesson)
  // files: File[];
} 
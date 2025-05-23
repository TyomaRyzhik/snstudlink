import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'enum', enum: ['admin', 'teacher', 'student'], unique: true })
  name: string
} 
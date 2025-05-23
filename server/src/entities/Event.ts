import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { User } from './User'
import { Group } from './Group'

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column()
  description: string

  @Column()
  startDate: Date

  @Column({ nullable: true })
  endDate: Date

  @Column({ nullable: true })
  location: string

  @ManyToOne(() => Group, (group) => group.events)
  group: Group

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[]

  @Column({ default: 0 })
  participantsCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
} 
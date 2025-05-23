import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm'
import { User } from './User'
import { Event } from './Event'

@Entity()
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  description: string

  @Column({ nullable: true })
  avatar: string

  @ManyToMany(() => User)
  @JoinTable()
  members: User[]

  @ManyToMany(() => User)
  @JoinTable()
  moderators: User[]

  @OneToMany(() => Event, (event) => event.group)
  events: Event[]

  @Column({ default: 0 })
  membersCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
} 
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm'
import { User } from './User'
import { Message } from './Message'

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[]

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
} 
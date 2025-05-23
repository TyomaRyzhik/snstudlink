import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { User } from './User'
import { Conversation } from './Conversation'

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  content: string

  @ManyToOne(() => User, (user) => user.messages)
  sender: User

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
} 
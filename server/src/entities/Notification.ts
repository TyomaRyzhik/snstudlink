import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { User } from './User'
import { Post } from './Post'
import { Comment } from './Comment'

export enum NotificationType {
  LIKE = 'like',
  RETWEET = 'retweet',
  COMMENT = 'comment',
  FOLLOW = 'follow'
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType

  @ManyToOne(() => User)
  recipient: User

  @ManyToOne(() => User)
  actor: User

  @ManyToOne(() => Post, { nullable: true })
  post: Post | null

  @ManyToOne(() => Comment, { nullable: true })
  comment: Comment | null

  @Column({ default: false })
  isRead: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
} 
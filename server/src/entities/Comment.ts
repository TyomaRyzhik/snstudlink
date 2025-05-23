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
import { Post } from './Post'

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  content: string

  @Column({ nullable: true })
  media: string

  @ManyToOne(() => User, (user) => user.comments)
  author: User

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post

  @ManyToMany(() => User)
  @JoinTable()
  likes: User[]

  @Column({ default: 0 })
  likesCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
} 
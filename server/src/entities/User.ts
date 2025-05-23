import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Post } from './Post'
import { Comment } from './Comment'
import { Group } from './Group'
import { List } from './List'
import { Message } from './Message'
import { CourseParticipant } from './CourseParticipant'
import { ChecklistItem } from './ChecklistItem'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column({ unique: true })
  nickname: string

  @Column()
  password: string

  @Column()
  group: string

  @Column({ nullable: true })
  about: string

  @Column({ nullable: true })
  avatar: string

  @Column({ nullable: true })
  banner: string

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[]

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[]

  @ManyToMany(() => Group)
  @JoinTable()
  groups: Group[]

  @ManyToMany(() => User)
  @JoinTable()
  followers: User[]

  @ManyToMany(() => User)
  @JoinTable()
  following: User[]

  @OneToMany(() => List, (list) => list.owner)
  lists: List[]

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[]

  @OneToMany(() => CourseParticipant, participant => participant.user)
  courseParticipants: CourseParticipant[]

  @OneToMany(() => ChecklistItem, checklistItem => checklistItem.user)
  checklistItems: ChecklistItem[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
} 
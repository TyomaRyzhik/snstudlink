import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Post } from './Post'
import { Comment } from './Comment'
import { Group } from './Group'
import { List } from './List'
import { Message } from './Message'
import { CourseParticipant } from './CourseParticipant'
import { ChecklistItem } from './ChecklistItem'
import { Role } from './Role'
import { File } from './File'

@Entity('users')
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
  user_group: string

  @Column({ nullable: true })
  about: string

  @Column({ nullable: true })
  avatar: string

  @Column({ nullable: true })
  banner: string

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role

  @Column({ nullable: true })
  role_id: number

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[]

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[]

  @ManyToMany(() => Group)
  @JoinTable()
  groups: Group[]

  @ManyToMany(() => User)
  @JoinTable({
    name: 'users_followers_users',
    joinColumn: {
      name: 'usersId_1',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'usersId_2',
      referencedColumnName: 'id'
    }
  })
  followers: User[]

  @ManyToMany(() => User)
  @JoinTable({
    name: 'users_followers_users',
    joinColumn: {
      name: 'usersId_2',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'usersId_1',
      referencedColumnName: 'id'
    }
  })
  following: User[]

  @OneToMany(() => List, (list) => list.owner)
  lists: List[]

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[]

  @OneToMany(() => CourseParticipant, participant => participant.user)
  courseParticipants: CourseParticipant[]

  @OneToMany(() => ChecklistItem, checklistItem => checklistItem.user)
  checklistItems: ChecklistItem[]

  @OneToMany(() => File, file => file.uploadedBy)
  uploadedFiles: File[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
} 
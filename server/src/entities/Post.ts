import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { User } from './User'
import { Comment } from './Comment'

interface PollOption {
  text: string;
  votes: number; // Общее количество голосов за эту опцию
  voterIds: string[]; // Список ID пользователей, проголосовавших за эту опцию
}

interface Poll {
  question: string;
  options: PollOption[];
  votes?: string[]; // Общий список ID пользователей, проголосовавших в опросе (можно оставить для обратной совместимости или удалить, если voterIds достаточно)
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  content: string

  @Column('simple-array', { nullable: true })
  media: string[]

  @Column('json', { nullable: true })
  poll: Poll | null

  @ManyToOne(() => User, (user) => user.posts)
  author: User

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[]

  @ManyToMany(() => User)
  @JoinTable()
  likes: User[]

  @ManyToMany(() => User)
  @JoinTable()
  retweets: User[]

  @Column({ default: 0 })
  likesCount: number

  @Column({ default: 0 })
  commentsCount: number

  @Column({ default: 0 })
  retweetsCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
} 
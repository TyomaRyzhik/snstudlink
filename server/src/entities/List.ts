import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { User } from './User'

@Entity()
export class List {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @ManyToOne(() => User, (user) => user.lists)
  owner: User

  @ManyToMany(() => User)
  @JoinTable()
  users: User[] // Users included in this list

  // Optionally, you might want to include posts in lists as well
  // @ManyToMany(() => Post)
  // @JoinTable()
  // posts: Post[];

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
} 
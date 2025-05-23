import { DataSource } from 'typeorm'
import { User } from './entities/User'
import { Post } from './entities/Post'
import { Comment } from './entities/Comment'
import { Group } from './entities/Group'
import { Event } from './entities/Event'
import { List } from './entities/List'
import { Message } from './entities/Message'
import { Conversation } from './entities/Conversation'
import { Notification } from './entities/Notification'
import { Course } from './entities/Course'
import { CourseParticipant } from './entities/CourseParticipant'
import { Lecture } from './entities/Lecture'
import { Assignment } from './entities/Assignment'
import { ChecklistItem } from './entities/ChecklistItem'
import { Role } from './entities/Role'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5434,
  username: 'studlink',
  password: 'studlink_password',
  database: 'studlink_db',
  synchronize: false,
  logging: false,
  entities: [
    User,
    Post,
    Comment,
    Group,
    Event,
    List,
    Message,
    Conversation,
    Notification,
    Course,
    CourseParticipant,
    Lecture,
    Assignment,
    ChecklistItem,
    Role
  ],
  subscribers: [],
  migrations: [],
}) 
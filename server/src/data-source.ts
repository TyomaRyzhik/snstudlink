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
import { Conference } from './entities/Conference'
import { Meeting } from './entities/Meeting'
import { File } from './entities/File'
import { Subject } from './entities/Subject'
import { Lesson } from './entities/Lesson'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5435'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'studlink',
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
    Role,
    Conference,
    Meeting,
    File,
    Subject,
    Lesson
  ],
  subscribers: [],
  migrations: ["src/migrations/**/*.ts"],
}) 
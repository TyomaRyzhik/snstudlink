import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { AppDataSource } from './data-source'
import { userRouter } from './routes/user'
import { postRouter } from './routes/post'
import { authRouter } from './routes/auth'
import { notificationRouter } from './routes/notification'
import { listRouter } from './routes/list'
import { messageRouter } from './routes/message'
import { courseRouter } from './routes/course'
import { lectureRouter } from './routes/lecture'
import { assignmentRouter } from './routes/assignment'
import checklistRoutes from './routes/checklistRoutes'
import path from 'path'
import { requestLogger } from './middleware/logger'

const app = express()

// Настройка CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// Настройка статической раздачи файлов
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use(express.json())

// Routes
app.use('/api/users', userRouter)
app.use('/api/posts', postRouter)
app.use('/api/auth', authRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/lists', listRouter)
app.use('/api/messages', messageRouter)
app.use('/api/courses', courseRouter)
app.use('/api/lectures', lectureRouter)
app.use('/api/assignments', assignmentRouter)
app.use('/api/checklist', checklistRoutes)

// Request logging middleware
app.use(requestLogger)

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection initialized')
    const PORT = process.env.PORT || 3001
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Error during database initialization:', error)
    process.exit(1)
  }) 
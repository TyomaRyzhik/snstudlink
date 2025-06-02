import 'dotenv/config'
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
import courseRouter from './routes/course'
import { lectureRouter } from './routes/lecture'
import { assignmentRouter } from './routes/assignment'
import checklistRoutes from './routes/checklistRoutes'
import conferenceRoutes from './routes/conferenceRoutes'
import subjectRouter from './routes/subject'
import lessonRouter from './routes/lesson'
import path from 'path'
import { requestLogger } from './middleware/logger'
import fs from 'fs'
import { pool } from './db/config'

const app = express()

// Настройка CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}))

// Создаем папку uploads, если она не существует
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Настройка статической раздачи файлов
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, _path) => {
    // Set CORS headers for static files
    res.set('Access-Control-Allow-Origin', 'http://localhost:5173')
    res.set('Access-Control-Allow-Methods', 'GET')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
  }
}))

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
app.use('/api/conferences', conferenceRoutes)
app.use('/api/subjects', subjectRouter)
app.use('/api/lessons', lessonRouter)

// Request logging middleware
app.use(requestLogger)

// Execute migrations
async function runMigrations() {
  console.log('Starting migrations...');
  try {
    const migrationFiles = fs.readdirSync(path.join(__dirname, 'db/migrations'))
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files.`);

    // First, try to create migrations table if it doesn't exist
    try {
      console.log('Attempting to create migrations table if not exists...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Migrations table check/creation complete.');
    } catch (error) {
      console.error('Error creating migrations table:', error);
    }

    // Get list of executed migrations
    console.log('Fetching list of executed migrations...');
    const { rows: executedMigrations } = await pool.query('SELECT name FROM migrations');
    const executedSet = new Set(executedMigrations.map(m => m.name));
    console.log(`Found ${executedSet.size} already executed migrations.`);

    // Execute each migration in a transaction
    for (const file of migrationFiles) {
      if (!executedSet.has(file)) {
        console.log(`Executing migration: ${file}`);
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const sql = fs.readFileSync(path.join(__dirname, 'db/migrations', file), 'utf8');
          console.log(`Executing SQL for ${file}:\n${sql.substring(0, 200)}...`); // Log first 200 chars of SQL
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`Migration ${file} executed successfully`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Error executing migration ${file}:`, error);
          console.error(`Migration error details for ${file}:`, error);
          throw error; // Rethrow the error to stop server startup if migration fails
        } finally {
          client.release();
        }
      } else {
          console.log(`Migration ${file} already executed, skipping.`);
      }
    }
    console.log('All migrations processed.');
  } catch (error) {
    console.error('Error during runMigrations function execution:', error);
    // Do not rethrow here, let the main catch block handle server startup failure
  }
}

// Initialize database connection and run migrations
AppDataSource.initialize()
  .then(async () => {
    console.log('Database connection initialized');
    await runMigrations(); // Ensure migrations run before server starts listening
    const PORT = process.env.PORT || 3003;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error during database initialization or migration execution:', error);
    process.exit(1);
  });

// Error handling middleware (optional but recommended)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).send('Internal Server Error');
}); 
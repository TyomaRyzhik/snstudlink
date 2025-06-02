import dotenv from 'dotenv';
import { pool } from './config';
import fs from 'fs';
import path from 'path';

dotenv.config();

interface Migration {
  name: string;
}

async function runMigrations() {
  const client = await pool.connect();
  console.log('Database client connected.');
  
  try {
    // Создаем таблицу для отслеживания миграций, если её нет
    console.log('Checking if migrations table exists and creating if necessary...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Получаем список выполненных миграций
    console.log('Fetching executed migrations from the database...');
    const { rows: executedMigrations } = await client.query<Migration>(
      'SELECT name FROM migrations ORDER BY id'
    );
    const executedMigrationNames = new Set(executedMigrations.map((m: Migration) => m.name));

    // Получаем список файлов миграций
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Выполняем новые миграции
    for (const file of migrationFiles) {
      if (!executedMigrationNames.has(file)) {
        console.log(`Executing migration: ${file}`);
        
        const migrationPath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(migrationSQL);
          await client.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [file]
          );
          await client.query('COMMIT');
          console.log(`Migration ${file} completed successfully`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Error executing migration ${file}:`, error);
          throw error;
        }
      }
    }

    console.log('All migrations completed successfully');
  } finally {
    client.release();
  }
}

// Запускаем миграции
runMigrations().catch(console.error); 
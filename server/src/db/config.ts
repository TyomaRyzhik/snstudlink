import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD?.length);
console.log('DB_NAME:', process.env.DB_NAME);

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost', // Используем переменную или fallback
  port: parseInt(process.env.DB_PORT || '5435'), // Используем переменную или fallback (порт 5435)
  user: process.env.DB_USER || 'postgres', // Используем переменную или fallback
  password: process.env.DB_PASSWORD || 'postgres', // Используем переменную или fallback
  database: process.env.DB_NAME || 'studlink', // Используем переменную или fallback
});

// Проверка подключения
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // process.exit(-1); // Commented out
}); 
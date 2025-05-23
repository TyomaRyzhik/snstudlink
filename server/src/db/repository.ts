import { pool } from './config';
import { BaseEntity } from '../types/database';
import { QueryResult } from 'pg';

export class Repository<T extends BaseEntity> {
  protected tableName: string;
  protected columns: string[];

  constructor(tableName: string, columns: string[]) {
    this.tableName = tableName;
    this.columns = columns;
  }

  protected async query(text: string, params?: any[]): Promise<QueryResult> {
    return pool.query(text, params);
  }

  async findById(id: string): Promise<T | null> {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findAll(): Promise<T[]> {
    const { rows } = await this.query(`SELECT * FROM ${this.tableName}`);
    return rows;
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const columns = [...Object.keys(data), 'created_at', 'updated_at'];
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (${columns.join(', ')}) 
       VALUES (${placeholders}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING *`,
      values
    );
    
    return rows[0];
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T | null> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    
    if (columns.length === 0) return null;

    const setClause = columns
      .map((col, i) => `${col} = $${i + 2}`)
      .join(', ');
    
    const { rows } = await this.query(
      `UPDATE ${this.tableName} 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id, ...values]
    );
    
    return rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async findBy(conditions: Partial<T>): Promise<T[]> {
    const entries = Object.entries(conditions);
    if (entries.length === 0) return this.findAll();

    const whereClause = entries
      .map(([key], i) => `${key} = $${i + 1}`)
      .join(' AND ');
    
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE ${whereClause}`,
      Object.values(conditions)
    );
    
    return rows;
  }

  async insertInitialData(data: any[]): Promise<void> {
    if (data.length === 0) return;

    const columns = Object.keys(data[0]);
    const values = data.map(item => Object.values(item));
    const placeholders = values.map((_, i) => 
      `(${values[i].map((_, j) => `$${i * values[i].length + j + 1}`).join(', ')})`
    ).join(', ');

    await this.query(
      `INSERT INTO ${this.tableName} (${columns.join(', ')}) 
       VALUES ${placeholders}
       ON CONFLICT DO NOTHING`,
      values.flat()
    );
  }
} 
import { Repository } from '../repository';
import { PomodoroTask, PomodoroStatus } from '../../types/database';

export class PomodoroRepository extends Repository<PomodoroTask> {
  constructor() {
    super('pomodoro_tasks', [
      'user_id',
      'title',
      'description',
      'status',
      'created_at',
      'updated_at'
    ]);
  }

  async findByUser(userId: string): Promise<PomodoroTask[]> {
    const { rows } = await this.query(
      'SELECT * FROM pomodoro_tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  async findByStatus(userId: string, status: PomodoroStatus): Promise<PomodoroTask[]> {
    const { rows } = await this.query(
      'SELECT * FROM pomodoro_tasks WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC',
      [userId, status]
    );
    return rows;
  }

  async updateStatus(id: string, status: PomodoroStatus): Promise<PomodoroTask | null> {
    const { rows } = await this.query(
      'UPDATE pomodoro_tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0] || null;
  }

  async deleteCompleted(userId: string): Promise<boolean> {
    const result = await this.query(
      'DELETE FROM pomodoro_tasks WHERE user_id = $1 AND status = $2',
      [userId, 'done']
    );
    return (result.rowCount ?? 0) > 0;
  }
} 
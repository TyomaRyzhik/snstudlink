import { Repository } from '../repository';
import { Reaction, ReactionType } from '../../types/database';

export class ReactionRepository extends Repository<Reaction> {
  constructor() {
    super('reactions', [
      'post_id',
      'user_id',
      'type',
      'created_at'
    ]);
  }

  async findOne(postId: string, userId: string, type: ReactionType): Promise<Reaction | null> {
    const { rows } = await this.query(
      'SELECT * FROM reactions WHERE post_id = $1 AND user_id = $2 AND type = $3',
      [postId, userId, type]
    );
    return rows[0] || null;
  }

  async findByPost(postId: string): Promise<Reaction[]> {
    const { rows } = await this.query(
      `SELECT r.*, u.name as user_name 
       FROM reactions r
       JOIN users u ON r.user_id = u.id
       WHERE r.post_id = $1
       ORDER BY r.created_at DESC`,
      [postId]
    );
    return rows;
  }

  async findByUser(userId: string): Promise<Reaction[]> {
    const { rows } = await this.query(
      'SELECT * FROM reactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  async toggleReaction(postId: string, userId: string, type: ReactionType): Promise<Reaction | null> {
    await this.query('BEGIN');

    try {
      // Проверяем существующую реакцию
      const { rows: existing } = await this.query(
        'SELECT * FROM reactions WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );

      if (existing.length > 0) {
        if (existing[0].type === type) {
          // Если реакция такая же, удаляем её
          await this.query(
            'DELETE FROM reactions WHERE post_id = $1 AND user_id = $2',
            [postId, userId]
          );
          await this.query('COMMIT');
          return null;
        } else {
          // Если реакция другого типа, обновляем её
          const { rows } = await this.query(
            'UPDATE reactions SET type = $1, created_at = CURRENT_TIMESTAMP WHERE post_id = $2 AND user_id = $3 RETURNING *',
            [type, postId, userId]
          );
          await this.query('COMMIT');
          return rows[0];
        }
      } else {
        // Если реакции нет, создаём новую
        const { rows } = await this.query(
          'INSERT INTO reactions (post_id, user_id, type) VALUES ($1, $2, $3) RETURNING *',
          [postId, userId, type]
        );
        await this.query('COMMIT');
        return rows[0];
      }
    } catch (error) {
      await this.query('ROLLBACK');
      throw error;
    }
  }

  async deleteByPost(postId: string): Promise<boolean> {
    const result = await this.query(
      'DELETE FROM reactions WHERE post_id = $1',
      [postId]
    );
    return (result.rowCount ?? 0) > 0;
  }
} 
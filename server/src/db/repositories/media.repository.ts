import { Repository } from '../repository';
import { Media, MediaType } from '../../types/database';

export class MediaRepository extends Repository<Media> {
  constructor() {
    super('media', [
      'post_id',
      'type',
      'path',
      'created_at'
    ]);
  }

  async findByPost(postId: string): Promise<Media[]> {
    const { rows } = await this.query(
      'SELECT * FROM media WHERE post_id = $1 ORDER BY created_at DESC',
      [postId]
    );
    return rows;
  }

  async findByType(type: MediaType): Promise<Media[]> {
    const { rows } = await this.query(
      'SELECT * FROM media WHERE type = $1 ORDER BY created_at DESC',
      [type]
    );
    return rows;
  }

  async create(data: Omit<Media, 'id' | 'created_at'>): Promise<Media> {
    const { rows } = await this.query(
      'INSERT INTO media (post_id, type, path) VALUES ($1, $2, $3) RETURNING *',
      [data.post_id, data.type, data.path]
    );
    return rows[0];
  }

  async deleteByPost(postId: string): Promise<boolean> {
    const result = await this.query(
      'DELETE FROM media WHERE post_id = $1',
      [postId]
    );
    return (result.rowCount ?? 0) > 0;
  }
} 
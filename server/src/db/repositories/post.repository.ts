import { Repository } from '../repository';
import { Post } from '../../types/database';
import { MediaRepository } from './media.repository';
import { pool } from '../config';

export class PostRepository extends Repository<Post> {
  private media: MediaRepository;

  constructor() {
    super('posts', [
      'author_id',
      'content',
      'media',
      'poll',
      'created_at',
      'updated_at'
    ]);
    this.media = new MediaRepository();
  }

  async create(data: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert post with current timestamp
      const { rows: [post] } = await client.query(
        'INSERT INTO posts (author_id, content, media, poll, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
        [data.author_id, data.content, data.media || [], data.poll]
      );

      // Create media entries if any
      if (data.media && data.media.length > 0) {
        for (const path of data.media) {
          const type = path.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' :
                      path.match(/\.(mp4|webm|mov)$/i) ? 'video' :
                      path.match(/\.(mp3|wav|ogg)$/i) ? 'audio' : 'file';
          await this.media.create({
            post_id: post.id,
            type,
            path
          });
        }
      }

      await client.query('COMMIT');

      // Get author information
      const { rows: [author] } = await client.query(
        'SELECT id, name, nickname, avatar FROM users WHERE id = $1',
        [data.author_id]
      );

      return {
        ...post,
        author: author
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findByAuthor(authorId: string): Promise<Post[]> {
    const { rows } = await this.query(
      'SELECT p.*, json_build_object(\'id\', u.id, \'name\', u.name, \'nickname\', u.nickname, \'avatar\', u.avatar) as author FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.author_id = $1 ORDER BY p.created_at DESC',
      [authorId]
    );
    return rows;
  }

  async findWithMedia(postId: string): Promise<Post | null> {
    const { rows } = await this.query(
      'SELECT p.*, json_build_object(\'id\', u.id, \'name\', u.name, \'nickname\', u.nickname, \'avatar\', u.avatar) as author, json_agg(json_build_object(\'id\', m.id, \'type\', m.type, \'path\', m.path, \'created_at\', m.created_at)) as media FROM posts p LEFT JOIN users u ON p.author_id = u.id LEFT JOIN media m ON p.id = m.post_id WHERE p.id = $1 GROUP BY p.id, u.id',
      [postId]
    );
    return rows[0] || null;
  }

  async findAllWithMedia(page = 1, limit = 10): Promise<Post[]> {
    const offset = (page - 1) * limit;
    const { rows } = await this.query(
      'SELECT p.*, json_build_object(\'id\', u.id, \'name\', u.name, \'nickname\', u.nickname, \'avatar\', u.avatar) as author, json_agg(json_build_object(\'id\', m.id, \'type\', m.type, \'path\', m.path, \'created_at\', m.created_at)) as media FROM posts p LEFT JOIN users u ON p.author_id = u.id LEFT JOIN media m ON p.id = m.post_id GROUP BY p.id, u.id ORDER BY p.created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return rows;
  }
} 
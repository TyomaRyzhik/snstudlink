import { Repository } from '../repository';
import { Comment } from '../../types/database';

export class CommentRepository extends Repository<Comment> {
  constructor() {
    super('comments', [
      'post_id',
      'author_id',
      'content',
      'created_at'
    ]);
  }

  async findByPost(postId: string): Promise<Comment[]> {
    const { rows } = await this.query(
      `SELECT c.*, u.name as author_name 
       FROM comments c
       JOIN users u ON c.author_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [postId]
    );
    return rows;
  }

  async findByAuthor(authorId: string): Promise<Comment[]> {
    const { rows } = await this.query(
      'SELECT * FROM comments WHERE author_id = $1 ORDER BY created_at DESC',
      [authorId]
    );
    return rows;
  }

  async deleteByPost(postId: string): Promise<boolean> {
    const result = await this.query(
      'DELETE FROM comments WHERE post_id = $1',
      [postId]
    );
    return (result.rowCount ?? 0) > 0;
  }
} 
import { BaseRepository } from '../../repositories/BaseRepository';
import { Post } from '../../entities/Post';
import { pool } from '../config';

interface CreatePostDto {
    content: string;
    author_id: string;
    media?: string[];
    poll?: any;
}

import { User } from '../../entities/User';

export class PostRepository extends BaseRepository<Post> {

  constructor() {
    super('posts');
  }

  async create(data: CreatePostDto): Promise<Post> {
    // Temporarily ignore media to debug database schema issue
    const result = await pool.query(
      `INSERT INTO posts (author_id, content, poll)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.author_id, data.content, data.poll]
    );
    // We need to fetch the author and media to return a complete Post object
    const createdPost = result.rows[0];
    if (!createdPost) {
        throw new Error('Failed to create post');
    }
    // Note: findWithMedia will still try to fetch media, which might cause issues
    // depending on its implementation and the actual DB schema.
    // We'll address this after confirming basic text post creation.
    const postWithDetails = await this.findWithMedia(createdPost.id);
    if (!postWithDetails) {
        // This should ideally not happen if creation was successful
        return createdPost; // Return basic post if fetching fails
    }
    return postWithDetails;
  }

  async findByAuthor(authorId: string): Promise<Post[]> {
    const { rows } = await pool.query(
      `SELECT p.*,
        json_build_object('id', u.id, 'name', u.name, 'nickname', u.nickname, 'avatar', u.avatar) as author,
        p.media as media,
        COALESCE(json_agg(DISTINCT l.user_id) FILTER (WHERE l.user_id IS NOT NULL), '[]') as likes,
        COALESCE(json_agg(DISTINCT r.user_id) FILTER (WHERE r.user_id IS NOT NULL), '[]') as retweets
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_likes l ON p.id = l.post_id
      LEFT JOIN post_retweets r ON p.id = r.post_id
      WHERE p.author_id = $1
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC`,
      [authorId]
    );
    // Map rows to Post objects if necessary, ensuring author and media are correctly structured
    return rows.map(row => ({
        ...row,
        author: row.author as User, // Assuming author structure matches User type
        media: row.media as string[], // Assuming media is stored as JSONB array of strings
        likesCount: row.likes_count, // Explicitly map likes_count from DB to likesCount
    })) as Post[];
  }

  async findWithMedia(postId: string): Promise<Post | null> {
    const { rows } = await pool.query(
      `SELECT p.*,
        json_build_object('id', u.id, 'name', u.name, 'nickname', u.nickname, 'avatar', u.avatar) as author,
        p.media as media,
        COALESCE(json_agg(DISTINCT l.user_id) FILTER (WHERE l.user_id IS NOT NULL), '[]') as likes,
        COALESCE(json_agg(DISTINCT r.user_id) FILTER (WHERE r.user_id IS NOT NULL), '[]') as retweets
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_likes l ON p.id = l.post_id
      LEFT JOIN post_retweets r ON p.id = r.post_id
      WHERE p.id = $1
      GROUP BY p.id, u.id`,
      [postId]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
        ...row,
        author: row.author as User, // Assuming author structure matches User type
        media: row.media as string[], // Assuming media is stored as JSONB array of strings
        likesCount: row.likes_count, // Explicitly map likes_count from DB to likesCount
    } as Post;
  }

  async findAllWithMedia(page = 1, limit = 10): Promise<Post[]> {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT p.*,
        json_build_object('id', u.id, 'name', u.name, 'nickname', u.nickname, 'avatar', u.avatar) as author,
        p.media as media,
        COALESCE(json_agg(DISTINCT l.user_id) FILTER (WHERE l.user_id IS NOT NULL), '[]') as likes,
        COALESCE(json_agg(DISTINCT r.user_id) FILTER (WHERE r.user_id IS NOT NULL), '[]') as retweets
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_likes l ON p.id = l.post_id
      LEFT JOIN post_retweets r ON p.id = r.post_id
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows.map(row => ({
        ...row,
        author: row.author as User, // Assuming author structure matches User type
        media: row.media as string[], // Assuming media is stored as JSONB array of strings
        likesCount: row.likes_count, // Explicitly map likes_count from DB to likesCount
    })) as Post[];
  }

  async toggleLike(postId: string, userId: string): Promise<{ hasLiked: boolean; updatedPost: Post | null }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if like exists
      const { rows: [existingLike] } = await client.query(
        'SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );

      console.log(`[PostRepository] toggleLike: existingLike check for postId ${postId}, userId ${userId}:`, existingLike);

      if (existingLike) {
        console.log(`[PostRepository] toggleLike: Existing like found. Attempting to DELETE.`);
        // Remove like
        await client.query(
          'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
          [postId, userId]
        );
        console.log(`[PostRepository] toggleLike: Deleted like for postId ${postId}, userId ${userId}.`);
        // Recalculate likes count after deletion
        const { rows: [{ count: newCountAfterDelete }] } = await client.query(
          'SELECT COUNT(*) FROM post_likes WHERE post_id = $1',
          [postId]
        );
        console.log(`[PostRepository] toggleLike: New count after delete for postId ${postId}: ${newCountAfterDelete}`);
        await client.query(
          'UPDATE posts SET likes_count = $1 WHERE id = $2',
          [parseInt(newCountAfterDelete), postId]
        );
        console.log(`[PostRepository] toggleLike: Posts table updated for postId ${postId} with count ${newCountAfterDelete}.`);
      } else {
        console.log(`[PostRepository] toggleLike: No existing like found. Attempting to INSERT.`);
        // Add like
        await client.query(
          'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
          [postId, userId]
        );
        console.log(`[PostRepository] toggleLike: Inserted like for postId ${postId}, userId ${userId}.`);
        // Recalculate likes count after insertion
        const { rows: [{ count: newCountAfterInsert }] } = await client.query(
          'SELECT COUNT(*) FROM post_likes WHERE post_id = $1',
          [postId]
        );
        console.log(`[PostRepository] toggleLike: New count after insert for postId ${postId}: ${newCountAfterInsert}`);
        await client.query(
          'UPDATE posts SET likes_count = $1 WHERE id = $2',
          [parseInt(newCountAfterInsert), postId]
        );
        console.log(`[PostRepository] toggleLike: Posts table updated for postId ${postId} with count ${newCountAfterInsert}.`);
      }

      await client.query('COMMIT');
      console.log(`[PostRepository] toggleLike: Transaction committed for postId ${postId}.`);

      // Get the updated post with all necessary details
      const updatedPost = await this.findWithMedia(postId);
      console.log(`[PostRepository] toggleLike: Fetched updatedPost for postId ${postId}:`, updatedPost);
      
      // Return the correct like state
      return {
        hasLiked: !existingLike, // true if we added a like, false if we removed it
        updatedPost
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[PostRepository] toggleLike error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async toggleRetweet(postId: string, userId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if retweet exists
      const { rows: [existingRetweet] } = await client.query(
        'SELECT * FROM post_retweets WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );

      if (existingRetweet) {
        // Remove retweet
        await client.query(
          'DELETE FROM post_retweets WHERE post_id = $1 AND user_id = $2',
          [postId, userId]
        );
        await client.query(
          'UPDATE posts SET retweets_count = retweets_count - 1 WHERE id = $1',
          [postId]
        );
      } else {
        // Add retweet
        await client.query(
          'INSERT INTO post_retweets (post_id, user_id) VALUES ($1, $2)',
          [postId, userId]
        );
        await client.query(
          'UPDATE posts SET retweets_count = retweets_count + 1 WHERE id = $1',
          [postId]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<Post | null> {
    // Use findWithMedia as it provides all necessary details including author and media
    return this.findWithMedia(id);
  }

  async hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
    const { rows } = await pool.query(
      'SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
    return rows.length > 0;
  }

  async remove(id: string): Promise<void> {
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
  }
}

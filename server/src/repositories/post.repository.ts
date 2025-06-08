import { Entity, PrimaryGeneratedColumn, Column, Repository, DataSource } from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  likeCount: number;
}

export class PostRepository extends Repository<Post> {
  constructor(private dataSource: DataSource) {
    super(Post, dataSource.createEntityManager());
  }

  async toggleLike(postId: number, userId: number): Promise<{ liked: boolean; likeCount: number }> {
    const post = await this.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error('Post not found');
    }

    // Check if the user has already liked the post
    const existingLike = await this.dataSource
      .createQueryBuilder()
      .select('post_likes')
      .from('post_likes', 'post_likes')
      .where('post_likes.post_id = :postId', { postId })
      .andWhere('post_likes.user_id = :userId', { userId })
      .getOne();

    if (existingLike) {
      // Unlike the post
      await this.dataSource
        .createQueryBuilder()
        .delete()
        .from('post_likes')
        .where('post_id = :postId', { postId })
        .andWhere('user_id = :userId', { userId })
        .execute();

      // Update the like count
      await this.dataSource
        .createQueryBuilder()
        .update(Post)
        .set({ likeCount: () => 'like_count - 1' })
        .where('id = :postId', { postId })
        .execute();

      // Get the updated post
      const updatedPost = await this.findOne({ where: { id: postId } });
      return {
        liked: false,
        likeCount: updatedPost?.likeCount || 0
      };
    } else {
      // Like the post
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('post_likes')
        .values({ post_id: postId, user_id: userId })
        .execute();

      // Update the like count
      await this.dataSource
        .createQueryBuilder()
        .update(Post)
        .set({ likeCount: () => 'like_count + 1' })
        .where('id = :postId', { postId })
        .execute();

      // Get the updated post
      const updatedPost = await this.findOne({ where: { id: postId } });
      return {
        liked: true,
        likeCount: updatedPost?.likeCount || 0
      };
    }
  }
} 
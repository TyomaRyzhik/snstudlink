import { Post } from '../entities/Post';
import { BaseRepository } from './BaseRepository';
import { FindOptionsWhere } from 'typeorm';

export class PostRepository extends BaseRepository<Post> {
    constructor() {
        super(Post);
    }

    async findWithRelations(id: string): Promise<Post | null> {
        return this.repository.findOne({
            where: { id } as FindOptionsWhere<Post>,
            relations: ['author', 'comments', 'comments.author', 'likes']
        });
    }

    async findByAuthor(authorId: string): Promise<Post[]> {
        return this.repository.find({
            where: { author: { id: authorId } } as FindOptionsWhere<Post>,
            relations: ['author', 'comments', 'likes'],
            order: { createdAt: 'DESC' }
        });
    }

    async findFeed(userId: string): Promise<Post[]> {
        return this.repository
            .createQueryBuilder('post')
            .innerJoin('post.author', 'author')
            .leftJoin('author.followers', 'follower', 'follower.id = :userId', { userId })
            .where('author.id = :userId OR follower.id = :userId', { userId })
            .orderBy('post.createdAt', 'DESC')
            .getMany();
    }
} 
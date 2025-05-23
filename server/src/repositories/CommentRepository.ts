import { Comment } from '../entities/Comment';
import { BaseRepository } from './BaseRepository';
import { FindOptionsWhere } from 'typeorm';

export class CommentRepository extends BaseRepository<Comment> {
    constructor() {
        super(Comment);
    }

    async findWithRelations(id: string): Promise<Comment | null> {
        return this.repository.findOne({
            where: { id } as FindOptionsWhere<Comment>,
            relations: ['author', 'post', 'likes']
        });
    }

    async findByPost(postId: string): Promise<Comment[]> {
        return this.repository.find({
            where: { post: { id: postId } } as FindOptionsWhere<Comment>,
            relations: ['author', 'likes'],
            order: { createdAt: 'ASC' }
        });
    }

    async findByAuthor(authorId: string): Promise<Comment[]> {
        return this.repository.find({
            where: { author: { id: authorId } } as FindOptionsWhere<Comment>,
            relations: ['post', 'likes'],
            order: { createdAt: 'DESC' }
        });
    }
} 
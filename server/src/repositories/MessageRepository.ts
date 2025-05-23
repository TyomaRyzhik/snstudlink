import { Message } from '../entities/Message';
import { BaseRepository } from './BaseRepository';
import { FindOptionsWhere } from 'typeorm';

export class MessageRepository extends BaseRepository<Message> {
    constructor() {
        super(Message);
    }

    async findWithRelations(id: string): Promise<Message | null> {
        return this.repository.findOne({
            where: { id } as FindOptionsWhere<Message>,
            relations: ['sender', 'conversation']
        });
    }

    async findByConversation(conversationId: string): Promise<Message[]> {
        return this.repository.find({
            where: { conversation: { id: conversationId } } as FindOptionsWhere<Message>,
            relations: ['sender'],
            order: { createdAt: 'ASC' }
        });
    }

    async findBySender(senderId: string): Promise<Message[]> {
        return this.repository.find({
            where: { sender: { id: senderId } } as FindOptionsWhere<Message>,
            relations: ['conversation'],
            order: { createdAt: 'DESC' }
        });
    }
} 
import { Conversation } from '../entities/Conversation';
import { BaseRepository } from './BaseRepository';
import { FindOptionsWhere, In } from 'typeorm';
import { User } from '../entities/User';

export class ConversationRepository extends BaseRepository<Conversation> {
    constructor() {
        super(Conversation);
    }

    async findWithRelations(id: string): Promise<Conversation | null> {
        return this.repository.findOne({
            where: { id } as FindOptionsWhere<Conversation>,
            relations: ['participants', 'messages', 'messages.sender']
        });
    }

    async findByParticipant(userId: string): Promise<Conversation[]> {
        return this.repository
            .createQueryBuilder('conversation')
            .innerJoin('conversation.participants', 'participant')
            .where('participant.id = :userId', { userId })
            .leftJoinAndSelect('conversation.messages', 'message')
            .leftJoinAndSelect('message.sender', 'sender')
            .orderBy('message.createdAt', 'DESC')
            .getMany();
    }

    async findOrCreateByParticipants(participantIds: string[]): Promise<Conversation> {
        const existingConversation = await this.repository
            .createQueryBuilder('conversation')
            .innerJoin('conversation.participants', 'participant')
            .where('participant.id IN (:...participantIds)', { participantIds })
            .groupBy('conversation.id')
            .having('COUNT(DISTINCT participant.id) = :count', { count: participantIds.length })
            .getOne();

        if (existingConversation) {
            return existingConversation;
        }

        const participants = await this.repository.manager.find(User, {
            where: { id: In(participantIds) } as FindOptionsWhere<User>
        });

        return this.create({ participants });
    }
} 
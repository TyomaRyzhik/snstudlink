import { Notification } from '../entities/Notification';
import { BaseRepository } from './BaseRepository';
import { FindOptionsWhere } from 'typeorm';

export class NotificationRepository extends BaseRepository<Notification> {
    constructor() {
        super(Notification);
    }

    async findWithRelations(id: string): Promise<Notification | null> {
        return this.repository.findOne({
            where: { id } as FindOptionsWhere<Notification>,
            relations: ['recipient', 'actor', 'post', 'comment']
        });
    }

    async findByRecipient(recipientId: string): Promise<Notification[]> {
        return this.repository.find({
            where: { recipient: { id: recipientId } } as FindOptionsWhere<Notification>,
            relations: ['actor', 'post', 'comment'],
            order: { createdAt: 'DESC' }
        });
    }

    async markAsRead(id: string): Promise<Notification | null> {
        await this.repository.update(id, { isRead: true });
        return this.findOne(id);
    }

    async markAllAsRead(recipientId: string): Promise<void> {
        await this.repository.update(
            { recipient: { id: recipientId } } as FindOptionsWhere<Notification>,
            { isRead: true }
        );
    }
} 
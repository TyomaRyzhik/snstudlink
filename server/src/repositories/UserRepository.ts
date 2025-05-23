import { User } from '../entities/User';
import { BaseRepository } from './BaseRepository';
import { FindOptionsWhere } from 'typeorm';

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(User);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOneBy({ email } as FindOptionsWhere<User>);
    }

    async findByNickname(nickname: string): Promise<User | null> {
        return this.repository.findOneBy({ nickname } as FindOptionsWhere<User>);
    }

    async findWithRelations(id: string): Promise<User | null> {
        return this.repository.findOne({
            where: { id } as FindOptionsWhere<User>,
            relations: ['groups', 'followers', 'following', 'courseParticipants', 'checklistItems']
        });
    }
} 
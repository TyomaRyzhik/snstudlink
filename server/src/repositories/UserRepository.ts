import { User } from '../entities/User';
import { BaseRepository } from './BaseRepository';
import { FindOptionsWhere } from 'typeorm';

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(User);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOne({
            where: { email } as FindOptionsWhere<User>,
            relations: ['role']
        });
    }

    async findByNickname(nickname: string): Promise<User | null> {
        return this.repository.findOne({
            where: { nickname } as FindOptionsWhere<User>,
            relations: ['role']
        });
    }

    async findWithRelations(id: string): Promise<User | null> {
        return this.repository.findOne({
            where: { id } as FindOptionsWhere<User>,
            relations: ['role']
        });
    }
} 
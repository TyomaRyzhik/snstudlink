import { Group } from '../entities/Group';
import { BaseRepository } from './BaseRepository';
import { FindOptionsWhere } from 'typeorm';

export class GroupRepository extends BaseRepository<Group> {
    constructor() {
        super(Group);
    }

    async findWithRelations(id: string): Promise<Group | null> {
        return this.repository.findOne({
            where: { id } as FindOptionsWhere<Group>,
            relations: ['members', 'posts', 'posts.author']
        });
    }

    async findByMember(userId: string): Promise<Group[]> {
        return this.repository
            .createQueryBuilder('group')
            .innerJoin('group.members', 'member')
            .where('member.id = :userId', { userId })
            .getMany();
    }

    async findByName(name: string): Promise<Group[]> {
        return this.repository.find({
            where: { name } as FindOptionsWhere<Group>,
            relations: ['members']
        });
    }
} 
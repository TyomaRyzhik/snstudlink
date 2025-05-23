import { Repository, EntityTarget, FindOptionsWhere, ObjectLiteral, DeepPartial } from 'typeorm';
import { AppDataSource } from '../data-source';

export class BaseRepository<T extends ObjectLiteral> {
    protected repository: Repository<T>;

    constructor(entity: EntityTarget<T>) {
        this.repository = AppDataSource.getRepository(entity);
    }

    async findOne(id: string): Promise<T | null> {
        return this.repository.findOneBy({ id } as unknown as FindOptionsWhere<T>);
    }

    async findAll(): Promise<T[]> {
        return this.repository.find();
    }

    async create(data: DeepPartial<T>): Promise<T> {
        const entity = this.repository.create(data);
        return this.repository.save(entity);
    }

    async update(id: string, data: DeepPartial<T>): Promise<T | null> {
        await this.repository.update(id, data as any);
        return this.findOne(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
} 
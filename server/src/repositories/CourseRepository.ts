import { Course } from '../entities/Course';
import { BaseRepository } from './BaseRepository';
import { FindOptionsWhere } from 'typeorm';

export class CourseRepository extends BaseRepository<Course> {
    constructor() {
        super(Course);
    }

    async findWithParticipants(id: string): Promise<Course | null> {
        return this.repository.findOne({
            where: { id } as FindOptionsWhere<Course>,
            relations: ['participants', 'participants.user', 'lectures', 'assignments']
        });
    }

    async findByParticipant(userId: string): Promise<Course[]> {
        return this.repository
            .createQueryBuilder('course')
            .innerJoin('course.participants', 'participant')
            .innerJoin('participant.user', 'user')
            .where('user.id = :userId', { userId })
            .getMany();
    }
} 
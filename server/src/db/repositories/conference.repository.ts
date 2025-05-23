import { Repository } from '../repository';
import { Conference } from '../../types/database';

export class ConferenceRepository extends Repository<Conference> {
  constructor() {
    super('conferences', [
      'teacher_id',
      'room_name',
      'scheduled_at',
      'created_at'
    ]);
  }

  async findByTeacher(teacherId: string): Promise<Conference[]> {
    const { rows } = await this.query(
      'SELECT * FROM conferences WHERE teacher_id = $1 ORDER BY scheduled_at ASC',
      [teacherId]
    );
    return rows;
  }

  async findUpcoming(): Promise<Conference[]> {
    const { rows } = await this.query(
      'SELECT * FROM conferences WHERE scheduled_at > NOW() ORDER BY scheduled_at ASC'
    );
    return rows;
  }
} 
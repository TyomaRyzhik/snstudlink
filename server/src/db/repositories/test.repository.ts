import { Repository } from '../repository';
import { Test } from '../../types/database';

export class TestRepository extends Repository<Test> {
  constructor() {
    super('tests', [
      'subject_id',
      'title',
      'created_at'
    ]);
  }

  async findBySubject(subjectId: string): Promise<Test[]> {
    const { rows } = await this.query(
      'SELECT * FROM tests WHERE subject_id = $1 ORDER BY created_at DESC',
      [subjectId]
    );
    return rows;
  }
} 
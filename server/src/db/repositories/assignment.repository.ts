import { Repository } from '../repository';
import { Assignment } from '../../types/database';

export class AssignmentRepository extends Repository<Assignment> {
  constructor() {
    super('assignments', [
      'subject_id',
      'title',
      'due_date',
      'created_at'
    ]);
  }

  async findBySubject(subjectId: string): Promise<Assignment[]> {
    const { rows } = await this.query(
      'SELECT * FROM assignments WHERE subject_id = $1 ORDER BY due_date ASC',
      [subjectId]
    );
    return rows;
  }
} 
import { Repository } from '../repository';
import { TestResult } from '../../types/database';

export class TestResultRepository extends Repository<TestResult> {
  constructor() {
    super('test_results', [
      'test_id',
      'student_id',
      'score',
      'taken_at'
    ]);
  }

  async findByTest(testId: string): Promise<TestResult[]> {
    const { rows } = await this.query(
      'SELECT * FROM test_results WHERE test_id = $1 ORDER BY taken_at DESC',
      [testId]
    );
    return rows;
  }

  async findByStudent(studentId: string): Promise<TestResult[]> {
    const { rows } = await this.query(
      'SELECT * FROM test_results WHERE student_id = $1 ORDER BY taken_at DESC',
      [studentId]
    );
    return rows;
  }
} 
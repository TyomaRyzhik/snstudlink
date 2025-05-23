import { Repository } from '../repository';
import { TestQuestion } from '../../types/database';

export class TestQuestionRepository extends Repository<TestQuestion> {
  constructor() {
    super('test_questions', [
      'test_id',
      'question_text',
      'type',
      'options',
      'created_at'
    ]);
  }

  async findByTest(testId: string): Promise<TestQuestion[]> {
    const { rows } = await this.query(
      'SELECT * FROM test_questions WHERE test_id = $1 ORDER BY created_at ASC',
      [testId]
    );
    return rows;
  }
} 
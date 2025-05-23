import { Repository } from '../repository';
import { Material, MaterialType } from '../../types/database';

export class MaterialRepository extends Repository<Material> {
  constructor() {
    super('materials', [
      'subject_id',
      'type',
      'content',
      'created_at'
    ]);
  }

  async findBySubject(subjectId: string): Promise<Material[]> {
    const { rows } = await this.query(
      'SELECT * FROM materials WHERE subject_id = $1 ORDER BY created_at DESC',
      [subjectId]
    );
    return rows;
  }

  async findByType(subjectId: string, type: MaterialType): Promise<Material[]> {
    const { rows } = await this.query(
      'SELECT * FROM materials WHERE subject_id = $1 AND type = $2 ORDER BY created_at DESC',
      [subjectId, type]
    );
    return rows;
  }
} 
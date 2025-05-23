import { Repository } from '../repository';
import { Subject } from '../../types/database';

export class SubjectRepository extends Repository<Subject> {
  constructor() {
    super('subjects', [
      'teacher_id',
      'title',
      'created_at'
    ]);
  }

  async findByTeacher(teacherId: string): Promise<Subject[]> {
    const { rows } = await this.query(
      'SELECT * FROM subjects WHERE teacher_id = $1 ORDER BY created_at DESC',
      [teacherId]
    );
    return rows;
  }

  async findWithMaterials(id: string): Promise<Subject & { materials: any[] } | null> {
    const { rows } = await this.query(
      `SELECT s.*, 
              json_agg(json_build_object(
                'id', m.id,
                'type', m.type,
                'content', m.content,
                'created_at', m.created_at
              )) as materials
       FROM subjects s
       LEFT JOIN materials m ON s.id = m.subject_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );
    return rows[0] || null;
  }

  async findWithAssignments(id: string): Promise<Subject & { assignments: any[] } | null> {
    const { rows } = await this.query(
      `SELECT s.*, 
              json_agg(json_build_object(
                'id', a.id,
                'title', a.title,
                'due_date', a.due_date,
                'created_at', a.created_at
              )) as assignments
       FROM subjects s
       LEFT JOIN assignments a ON s.id = a.subject_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );
    return rows[0] || null;
  }

  async findWithTests(id: string): Promise<Subject & { tests: any[] } | null> {
    const { rows } = await this.query(
      `SELECT s.*, 
              json_agg(json_build_object(
                'id', t.id,
                'title', t.title,
                'created_at', t.created_at
              )) as tests
       FROM subjects s
       LEFT JOIN tests t ON s.id = t.subject_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );
    return rows[0] || null;
  }
} 
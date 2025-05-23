import { Repository } from '../repository';
import { User } from '../../types/database';

export class UserRepository extends Repository<User> {
  constructor() {
    super('users', [
      'email',
      'password',
      'name',
      'nickname',
      'user_group',
      'about',
      'avatar',
      'banner',
      'role_id',
      'created_at',
      'updated_at'
    ]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  }

  async findByNickname(nickname: string): Promise<User | null> {
    const { rows } = await this.query(
      'SELECT * FROM users WHERE nickname = $1',
      [nickname]
    );
    return rows[0] || null;
  }

  async findByRole(roleId: number): Promise<User[]> {
    const { rows } = await this.query(
      'SELECT * FROM users WHERE role_id = $1',
      [roleId]
    );
    return rows;
  }

  async updateRole(userId: string, roleId: number): Promise<User | null> {
    const { rows } = await this.query(
      'UPDATE users SET role_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [roleId, userId]
    );
    return rows[0] || null;
  }

  async getDefaultRole(): Promise<number> {
    const { rows } = await this.query(
      'SELECT id FROM roles WHERE name = $1',
      ['student']
    );
    return rows[0]?.id || 1; // Default to role_id 1 if not found
  }

  async create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    // If role_id is not provided, get the default role
    if (!data.role_id) {
      const defaultRoleId = await this.getDefaultRole();
      data.role_id = defaultRoleId;
    }
    
    const columns = [...Object.keys(data), 'created_at', 'updated_at'];
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (${columns.join(', ')}) 
       VALUES (${placeholders}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING *`,
      values
    );
    
    return rows[0];
  }
} 
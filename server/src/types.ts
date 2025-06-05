import { Request } from 'express'
import { User } from './types/database';

export interface AuthenticatedRequest extends Request {
  user?: { 
    id: string;
    role?: string; // Изменяем тип role на строку
  }
} 

export type { User }; 
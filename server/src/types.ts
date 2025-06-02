import { Request } from 'express'
import { UserRole } from './types/database'; // Assuming UserRole is defined here

export interface AuthenticatedRequest extends Request {
  user?: { 
    id: string;
    role?: string; // Изменяем тип role на строку
  }
} 
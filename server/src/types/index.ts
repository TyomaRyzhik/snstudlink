import { Request } from 'express'

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
  }
}

export interface UserResponse {
  id: string;
  name: string;
  nickname: string;
  email: string;
  role: string;
  avatar?: string;
  banner?: string;
  about?: string;
  user_group?: string;
  followers: string[];
  following: string[];
} 
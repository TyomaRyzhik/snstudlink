import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

export const studyRouter = Router();

// TODO: Add study-related routes
studyRouter.get('/', authenticateToken, (_req, res) => {
  res.json({ message: 'Study routes working' });
}); 
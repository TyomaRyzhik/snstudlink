import { Router, RequestHandler } from 'express';
import { conferenceController } from '../controllers/conferenceController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
// router.use(authenticateToken); // Temporarily commented out for testing

// Get all conferences
router.get('/', authenticateToken, conferenceController.getAll as RequestHandler);

// Create new conference
router.post('/', conferenceController.create as RequestHandler); // No authentication required for creation

// Get conference by ID
router.get('/:id', authenticateToken, conferenceController.getById as RequestHandler);

// Delete conference
router.delete('/:id', authenticateToken, conferenceController.delete as RequestHandler);

export default router; 
import { Router } from 'express';
import { getChecklistItems, createChecklistItem, updateChecklistItem, deleteChecklistItem } from '../controllers/checklistController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authenticateToken middleware to each route individually
router.get('/', authenticateToken, getChecklistItems);
router.post('/', authenticateToken, createChecklistItem);
router.put('/:id', authenticateToken, updateChecklistItem);
router.delete('/:id', authenticateToken, deleteChecklistItem);

export default router; 
import { Router } from 'express';
import { getMeetings, createMeeting, updateMeeting, deleteMeeting } from '../controllers/meetingController';
import { authenticateToken } from '../middleware/auth';

export const meetingRouter = Router();

meetingRouter.get('/', getMeetings);
meetingRouter.post('/', authenticateToken, createMeeting);
meetingRouter.put('/:id', authenticateToken, updateMeeting);
meetingRouter.delete('/:id', authenticateToken, deleteMeeting); 
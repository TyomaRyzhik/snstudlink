import express from 'express';
import { authRouter } from './auth';
import { userRouter } from './user';
import { courseRouter } from './course';
import { lectureRouter } from './lecture';
import { assignmentRouter } from './assignment';
import checklistRoutes from './checklistRoutes';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/courses', courseRouter);
router.use('/lectures', lectureRouter);
router.use('/assignments', assignmentRouter);
router.use('/checklist', checklistRoutes);

export default router; 
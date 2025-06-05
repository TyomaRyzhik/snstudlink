import { Router } from 'express';
import { authRouter } from './auth';
import { userRouter } from './user';
import { postRouter } from './post';
import courseRouter from './course';
import { meetingRouter } from './meeting';
import { studyRouter } from './study';
import { lectureRouter } from './lecture';
import { assignmentRouter } from './assignment';
import checklistRoutes from './checklistRoutes';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/posts', postRouter);
router.use('/courses', courseRouter);
router.use('/meetings', meetingRouter);
router.use('/study', studyRouter);
router.use('/lectures', lectureRouter);
router.use('/assignments', assignmentRouter);
router.use('/checklist', checklistRoutes);

export default router; 
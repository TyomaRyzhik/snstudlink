import { Router, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Lecture } from '../entities/Lecture';
import { Course } from '../entities/Course';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();
const lectureRepository = AppDataSource.getRepository(Lecture);
const courseRepository = AppDataSource.getRepository(Course);

// Get all lectures for a course
router.get('/course/:courseId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const lectures = await lectureRepository.find({
      where: { courseId },
      order: { order: 'ASC' },
    });

    res.json(lectures);
  } catch (error) {
    console.error('Get lectures error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new lecture
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { courseId, title, description, content, videoUrl, slidesUrl, order } = req.body;

    // Verify that the course exists and the user is a teacher
    const course = await courseRepository.findOne({
      where: { id: courseId },
      relations: ['participants'],
    });

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const isTeacher = course.participants.some(
      p => p.userId === req.user!.id && p.role === 'teacher'
    );

    if (!isTeacher) {
      res.status(403).json({ message: 'Only teachers can create lectures' });
      return;
    }

    const lecture = lectureRepository.create({
      courseId,
      title,
      description,
      content,
      videoUrl,
      slidesUrl,
      order,
    });

    await lectureRepository.save(lecture);
    res.status(201).json(lecture);
  } catch (error) {
    console.error('Create lecture error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a lecture
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title, description, content, videoUrl, slidesUrl, order } = req.body;

    const lecture = await lectureRepository.findOne({
      where: { id },
      relations: ['course', 'course.participants'],
    });

    if (!lecture) {
      res.status(404).json({ message: 'Lecture not found' });
      return;
    }

    const isTeacher = lecture.course.participants.some(
      p => p.userId === req.user!.id && p.role === 'teacher'
    );

    if (!isTeacher) {
      res.status(403).json({ message: 'Only teachers can update lectures' });
      return;
    }

    Object.assign(lecture, {
      title,
      description,
      content,
      videoUrl,
      slidesUrl,
      order,
    });

    await lectureRepository.save(lecture);
    res.json(lecture);
  } catch (error) {
    console.error('Update lecture error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a lecture
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const lecture = await lectureRepository.findOne({
      where: { id },
      relations: ['course', 'course.participants'],
    });

    if (!lecture) {
      res.status(404).json({ message: 'Lecture not found' });
      return;
    }

    const isTeacher = lecture.course.participants.some(
      p => p.userId === req.user!.id && p.role === 'teacher'
    );

    if (!isTeacher) {
      res.status(403).json({ message: 'Only teachers can delete lectures' });
      return;
    }

    await lectureRepository.remove(lecture);
    res.status(204).send();
  } catch (error) {
    console.error('Delete lecture error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const lectureRouter = router; 
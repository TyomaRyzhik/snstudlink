import { Router, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Assignment, AssignmentStatus, AssignmentType } from '../entities/Assignment';
import { Course } from '../entities/Course';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();
const assignmentRepository = AppDataSource.getRepository(Assignment);
const courseRepository = AppDataSource.getRepository(Course);

// Get all assignments for a course
router.get('/course/:courseId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const assignments = await assignmentRepository.find({
      where: { courseId },
      order: { createdAt: 'DESC' },
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new assignment
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const {
      courseId,
      title,
      description,
      type,
      status,
      dueDate,
      maxScore,
      instructions,
      submissionInstructions,
    } = req.body;

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
      res.status(403).json({ message: 'Only teachers can create assignments' });
      return;
    }

    const assignment = assignmentRepository.create({
      courseId,
      title,
      description,
      type: type || AssignmentType.HOMEWORK,
      status: status || AssignmentStatus.DRAFT,
      dueDate,
      maxScore,
      instructions,
      submissionInstructions,
    });

    await assignmentRepository.save(assignment);
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update an assignment
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const {
      title,
      description,
      type,
      status,
      dueDate,
      maxScore,
      instructions,
      submissionInstructions,
    } = req.body;

    const assignment = await assignmentRepository.findOne({
      where: { id },
      relations: ['course', 'course.participants'],
    });

    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' });
      return;
    }

    const isTeacher = assignment.course.participants.some(
      p => p.userId === req.user!.id && p.role === 'teacher'
    );

    if (!isTeacher) {
      res.status(403).json({ message: 'Only teachers can update assignments' });
      return;
    }

    Object.assign(assignment, {
      title,
      description,
      type,
      status,
      dueDate,
      maxScore,
      instructions,
      submissionInstructions,
    });

    await assignmentRepository.save(assignment);
    res.json(assignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete an assignment
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const assignment = await assignmentRepository.findOne({
      where: { id },
      relations: ['course', 'course.participants'],
    });

    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' });
      return;
    }

    const isTeacher = assignment.course.participants.some(
      p => p.userId === req.user!.id && p.role === 'teacher'
    );

    if (!isTeacher) {
      res.status(403).json({ message: 'Only teachers can delete assignments' });
      return;
    }

    await assignmentRepository.remove(assignment);
    res.status(204).send();
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const assignmentRouter = router; 
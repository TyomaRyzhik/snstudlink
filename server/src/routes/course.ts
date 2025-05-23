import { Router, Response } from 'express'
import { AppDataSource } from '../data-source'
import { Course } from '../entities/Course'
import { CourseParticipant, CourseRole } from '../entities/CourseParticipant'
import { authenticateToken } from '../middleware/auth'
import { AuthenticatedRequest } from '../types'

const router = Router()
const courseRepository = AppDataSource.getRepository(Course)
const courseParticipantRepository = AppDataSource.getRepository(CourseParticipant)

// Create new course
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const { title, description } = req.body

    if (!title || title.trim() === '') {
      res.status(400).json({ message: 'Course title is required' })
      return
    }

    const newCourse = courseRepository.create({
      title,
      description,
    })

    await courseRepository.save(newCourse)

    // Add the creator as a teacher to the course
    const creatorParticipant = courseParticipantRepository.create({
      course: newCourse,
      user: req.user,
      role: CourseRole.TEACHER,
    })

    await courseParticipantRepository.save(creatorParticipant)

    res.status(201).json(newCourse)
  } catch (error) {
    console.error('Create course error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get all courses
router.get('/', authenticateToken, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Fetch all courses and include participants to show teachers
    const courses = await courseRepository.find({
      relations: ['participants', 'participants.user'], // Load participants and their user details
    });

    // Format the courses to include teacher info
    const formattedCourses = courses.map(course => ({
      ...course,
      teachers: course.participants
        .filter(p => p.role === CourseRole.TEACHER)
        .map(p => ({
          id: p.user.id,
          nickname: p.user.nickname,
          name: p.user.name, // Include user's name
          avatar: p.user.avatar,
        })), // Map to include only relevant user info for teachers
      // You might want to include students later as needed
    }));

    res.json(formattedCourses);
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get course by id
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;

    const course = await courseRepository.findOne({
      where: { id: courseId },
      relations: ['participants', 'participants.user'], // Include participants and their user details
    });

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Format the course to include teacher info
    const formattedCourse = {
      ...course,
      teachers: course.participants
        .filter(p => p.role === CourseRole.TEACHER)
        .map(p => ({
          id: p.user.id,
          nickname: p.user.nickname,
          name: p.user.name,
          avatar: p.user.avatar,
        })),
      // You might want to include students later as needed
    };

    res.json(formattedCourse);
  } catch (error) {
    console.error('Get course by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const courseRouter = router 
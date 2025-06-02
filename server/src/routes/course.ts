import { Router, Response } from 'express'
import { AppDataSource } from '../data-source'
import { CourseParticipant, CourseRole } from '../entities/CourseParticipant'
import { CourseRepository } from '../repositories/CourseRepository'
import { authenticateToken } from '../middleware/auth'
import { AuthenticatedRequest } from '../types'
import { authorizeRole } from '../middleware/rbac'

const router = Router()
const courseRepository = new CourseRepository()
const courseParticipantRepository = AppDataSource.getRepository(CourseParticipant)

// Create new course
router.post('/', authenticateToken, authorizeRole(['teacher', 'super-admin']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const newCourse = await courseRepository.create({ title, description })

    // Add the creator as a teacher to the course
    const creatorParticipant = courseParticipantRepository.create({
      course: newCourse,
      user: { id: req.user.id },
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
    const courses = await courseRepository.findAll()

    // BaseRepository's findAll does not include relations.
    // To get courses with participants/teachers, we need a dedicated method in CourseRepository or modify findAll.
    // For now, let's just return all basic course entities.
    res.json(courses)
  } catch (error) {
    console.error('Get all courses error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get courses for the current authenticated user
router.get('/my', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const courses = await courseRepository.findByParticipant(req.user.id)

    res.json(courses)
  } catch (error) {
    console.error('Get user courses error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get course by id
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id

    // Use the findOne method from BaseRepository
    const course = await courseRepository.findOne(courseId)

    // Note: findOne in BaseRepository does not include relations by default.
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    // To include relations like participants/teachers, we might need a dedicated method
    // in CourseRepository (like findWithParticipants) or modify findOne.
    // For now, return the basic course object.
    res.json(course)
  } catch (error) {
    console.error('Get course by id error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router; 
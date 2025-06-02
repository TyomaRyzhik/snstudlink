import { Router } from 'express'
import { SubjectController } from '../controllers/SubjectController'
import { authenticateToken } from '../middleware/auth'
// import { authorizeRole } from '../middleware/rbac' // Комментируем импорт authorizeRole

const router = Router()
const subjectController = new SubjectController()

// Create new subject
// Удаляем authorizeRole middleware
router.post('/', authenticateToken, subjectController.create.bind(subjectController))

// Get all subjects
router.get('/', authenticateToken, subjectController.getAll.bind(subjectController))

// Get subject by id
router.get('/:id', authenticateToken, subjectController.getById.bind(subjectController))

// Update subject
// Удаляем authorizeRole middleware
router.put('/:id', authenticateToken, subjectController.update.bind(subjectController))

// Delete subject
// Удаляем authorizeRole middleware
router.delete('/:id', authenticateToken, subjectController.delete.bind(subjectController))

export default router 
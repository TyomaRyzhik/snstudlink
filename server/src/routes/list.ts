import { Router, Response } from 'express'
import { AppDataSource } from '../data-source'
import { List } from '../entities/List'
import { User } from '../entities/User'
import { authenticateToken } from '../middleware/auth'
import { AuthenticatedRequest } from '../types'

const router = Router()
const listRepository = AppDataSource.getRepository(List)
const userRepository = AppDataSource.getRepository(User)

// Create new list
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const { name } = req.body

    if (!name || !name.trim()) {
      res.status(400).json({ message: 'List name is required' })
      return
    }

    const user = await userRepository.findOne({ where: { id: req.user.id } })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const newList = listRepository.create({
      name,
      owner: user,
    })

    await listRepository.save(newList)

    res.status(201).json({
      id: newList.id,
      name: newList.name,
      createdAt: newList.createdAt,
    })

  } catch (error) {
    console.error('Create list error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export const listRouter = router 
import { Router, Response } from 'express'
import { AppDataSource } from '../data-source'
import { Notification } from '../entities/Notification'
import { authenticateToken } from '../middleware/auth'
import { AuthenticatedRequest } from '../types'

const router = Router()
const notificationRepository = AppDataSource.getRepository(Notification)

// Get user's notifications
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const notifications = await notificationRepository.find({
      where: { recipient: { id: req.user.id } },
      relations: ['actor', 'post', 'comment'],
      order: { createdAt: 'DESC' },
      take: 50
    })

    res.json(notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      actor: {
        id: notification.actor.id,
        nickname: notification.actor.nickname,
        avatar: notification.actor.avatar
      },
      post: notification.post ? {
        id: notification.post.id,
        content: notification.post.content
      } : null,
      comment: notification.comment ? {
        id: notification.comment.id,
        content: notification.comment.content
      } : null
    })))
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Mark notification as read
router.post('/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const notification = await notificationRepository.findOne({
      where: { 
        id: req.params.id,
        recipient: { id: req.user.id }
      }
    })

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' })
      return
    }

    notification.isRead = true
    await notificationRepository.save(notification)

    res.json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Mark notification as read error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Mark all notifications as read
router.post('/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    await notificationRepository.update(
      { recipient: { id: req.user.id }, isRead: false },
      { isRead: true }
    )

    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get unread notifications count
router.get('/unread-count', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const count = await notificationRepository.count({
      where: {
        recipient: { id: req.user.id },
        isRead: false
      }
    })

    res.json({ count })
  } catch (error) {
    console.error('Get unread notifications count error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export const notificationRouter = router 
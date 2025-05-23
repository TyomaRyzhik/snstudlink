import { Router, Request, Response } from 'express'
import { AppDataSource } from '../data-source'
import { User } from '../entities/User'
import { Notification, NotificationType } from '../entities/Notification'
import { authenticateToken } from '../middleware/auth'
import { AuthenticatedRequest } from '../types'
import multer from 'multer'
import path from 'path'
import { Request as ExpressRequest } from 'express'

const router = Router()
const userRepository = AppDataSource.getRepository(User)

// Настройка multer для загрузки файлов в папку uploads
const storage = multer.diskStorage({
  destination: (_req: ExpressRequest, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req: ExpressRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const user = await userRepository.findOne({
      where: { id: req.user.id },
      relations: ['followers', 'following', 'groups'],
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.json(user)
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get user by id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userRepository.findOne({
      where: { id: req.params.id },
      relations: ['followers', 'following', 'groups'],
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Update user
router.put('/me', authenticateToken, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const { name, about } = req.body
    const files = req.files as { [fieldname: string]: Express.Multer.File[] }

    const user = await userRepository.findOne({
      where: { id: req.user.id },
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    user.name = name || user.name
    user.about = about || user.about

    // Обновляем аватар, если он был загружен
    if (files.avatar && files.avatar[0]) {
      user.avatar = `/uploads/${files.avatar[0].filename}`
    }

    // Обновляем баннер, если он был загружен
    if (files.banner && files.banner[0]) {
      user.banner = `/uploads/${files.banner[0].filename}`
    }

    await userRepository.save(user)

    res.json(user)
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Follow user
router.post('/:id/follow', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const userToFollow = await userRepository.findOne({
      where: { id: req.params.id },
      relations: ['followers']
    })

    if (!userToFollow) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const currentUser = await userRepository.findOne({
      where: { id: req.user.id },
      relations: ['following']
    })

    if (!currentUser) {
      res.status(404).json({ message: 'Current user not found' })
      return
    }

    const isFollowing = userToFollow.followers.some(follower => follower.id === currentUser.id)

    if (isFollowing) {
      userToFollow.followers = userToFollow.followers.filter(follower => follower.id !== currentUser.id)
      currentUser.following = currentUser.following.filter(following => following.id !== userToFollow.id)
    } else {
      userToFollow.followers.push(currentUser)
      currentUser.following.push(userToFollow)
      
      // Create notification for follow
      const notification = new Notification()
      notification.type = NotificationType.FOLLOW
      notification.recipient = userToFollow
      notification.actor = currentUser
      notification.isRead = false
      await AppDataSource.getRepository(Notification).save(notification)
    }

    await userRepository.save([userToFollow, currentUser])

    res.json({
      message: isFollowing ? 'Unfollowed user' : 'Followed user',
      followersCount: userToFollow.followers.length,
      isFollowing: !isFollowing
    })
  } catch (error) {
    console.error('Follow user error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Unfollow user
router.post('/:id/unfollow', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const currentUser = await userRepository.findOne({
      where: { id: req.user.id },
      relations: ['following'],
    })

    const userToUnfollow = await userRepository.findOne({
      where: { id: req.params.id },
      relations: ['followers'],
    })

    if (!currentUser || !userToUnfollow) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    currentUser.following = currentUser.following.filter(
      (user) => user.id !== userToUnfollow.id
    )
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (user) => user.id !== currentUser.id
    )

    await userRepository.save([currentUser, userToUnfollow])

    res.json({ message: 'Successfully unfollowed user' })
  } catch (error) {
    console.error('Unfollow user error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Загрузка аватара
router.post('/me/avatar', authenticateToken, upload.single('avatar'), async (req: ExpressRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const user = await userRepository.findOne({ where: { id: req.user.id } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const file = (req as any).file as Express.Multer.File;
    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    user.avatar = `/uploads/${file.filename}`;
    await userRepository.save(user);
    res.json({ avatar: user.avatar });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Загрузка баннера
router.post('/me/banner', authenticateToken, upload.single('banner'), async (req: ExpressRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const user = await userRepository.findOne({ where: { id: req.user.id } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const file = (req as any).file as Express.Multer.File;
    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    user.banner = `/uploads/${file.filename}`;
    await userRepository.save(user);
    res.json({ banner: user.banner });
  } catch (error) {
    console.error('Upload banner error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const userRouter = router 
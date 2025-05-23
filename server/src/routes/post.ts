import { Router, Request, Response } from 'express'
import { PostRepository } from '../db/repositories/post.repository'
import { UserRepository } from '../db/repositories/user.repository'
import { CommentRepository } from '../db/repositories/comment.repository'
import { ReactionRepository } from '../db/repositories/reaction.repository'
import { authenticateToken } from '../middleware/auth'
import path from 'path'
import fs from 'fs'
import multer from 'multer'

// Создаем папку uploads, если она не существует
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: any
}

const router = Router()
const postRepository = new PostRepository()
const userRepository = new UserRepository()
const commentRepository = new CommentRepository()
const reactionRepository = new ReactionRepository()

// Create post
router.post('/', authenticateToken, upload.array('media', 10), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const { content, poll } = req.body
    const files = req.files as Express.Multer.File[]
    const user = await userRepository.findById(req.user.id)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    // Create post with media paths
    const mediaPaths = files ? files.map(file => `/uploads/${file.filename}`) : []
    const post = await postRepository.create({
      content,
      author_id: user.id,
      media: mediaPaths,
      poll: poll ? JSON.parse(poll) : null
    })

    res.status(201).json({
      ...post,
      author: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        avatar: user.avatar
      },
    })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({ message: 'Internal server error', error: error.toString() })
  }
})

// Get feed posts
router.get('/feed', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const user = await userRepository.findById(req.user.id)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    const posts = await postRepository.findAllWithMedia()
    res.json(posts)
  } catch (error) {
    console.error('Get feed error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get posts for current user
router.get('/user/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const posts = await postRepository.findByAuthor(req.user.id)
    res.json(posts)
  } catch (error) {
    console.error('Get user posts error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get posts by user id
router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await postRepository.findByAuthor(req.params.userId)
    res.json(posts)
  } catch (error) {
    console.error('Get user posts error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Like/Unlike post
router.post('/:id/like', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const postId = req.params.id
    const userId = req.user.id
    const result = await reactionRepository.toggleReaction(postId, userId, 'like')
    res.json(result)
  } catch (error) {
    console.error('Like post error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Delete post
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const postId = req.params.id
    const post = await postRepository.findById(postId)
    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }
    if (post.author_id !== req.user.id) {
      res.status(403).json({ message: 'Forbidden: You can only delete your own posts' })
      return
    }
    await postRepository.delete(postId)
    res.status(200).json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Add comment
router.post('/:id/comments', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const postId = req.params.id
    const { content } = req.body
    const post = await postRepository.findById(postId)
    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }
    const comment = await commentRepository.create({
      post_id: postId,
      author_id: req.user.id,
      content,
    })
    res.status(201).json(comment)
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get comments for post
router.get('/:id/comments', async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id
    const comments = await commentRepository.findByPost(postId)
    res.json(comments)
  } catch (error) {
    console.error('Get comments error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export const postRouter = router
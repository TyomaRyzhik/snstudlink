import { Router, Request, Response } from 'express'
import { PostRepository } from '../db/repositories/post.repository'
import { UserRepository } from '../db/repositories/user.repository'
import { CommentRepository } from '../db/repositories/comment.repository'
import { authenticateToken } from '../middleware/auth'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { AuthenticatedRequest } from '../types'
import { pool } from '../db/config'
// import { generateJitsiToken } from '../utils/jitsi' // Commented out for now

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

const router = Router()
const postRepository = new PostRepository()
const userRepository = new UserRepository()
const commentRepository = new CommentRepository()

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
    const posts = await postRepository.findAllWithMedia(1, 100)
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

// Get post by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await postRepository.findWithMedia(req.params.id) // Corrected method call
    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }
    res.json(post)
  } catch (error) {
    console.error('Get post by ID error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Like a post
router.post('/:id/like', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const postId = req.params.id
    const userId = req.user.id

    const post = await postRepository.findById(postId)
    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    // Toggle like and get the updated post in one operation
    const { hasLiked, updatedPost } = await postRepository.toggleLike(postId, userId)
    
    if (!updatedPost) {
      res.status(404).json({ message: 'Post not found after update' })
      return
    }

    console.log(`[PostRoute] Sending response: hasLiked=${hasLiked}, likesCount=${updatedPost.likesCount}`);

    res.json({ 
      message: hasLiked ? 'Post liked' : 'Post unliked',
      hasLiked: hasLiked,
      likesCount: updatedPost.likesCount
    })
  } catch (error) {
    console.error('Like post error:', error)
    res.status(500).json({ message: 'Internal server error', error: error.toString() })
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
    
    // Fetch author details and include them in the response
    const author = await userRepository.findById(req.user.id);

    // Increment comments count
    // Recalculate comments count after adding comment
    const { rows: [{ count }] } = await pool.query(
      'SELECT COUNT(*) FROM comments WHERE post_id = $1',
      [postId]
    );
    post.commentsCount = parseInt(count);
    await postRepository.update(postId, { commentsCount: post.commentsCount });

    res.status(201).json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at, // Assuming created_at is returned by commentRepository.create
      sender: author ? {
        id: author.id,
        nickname: author.nickname,
        avatar: author.avatar,
      } : null,
      commentsCount: post.commentsCount, // Include the updated comments count
    });

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

    const commentsWithAuthorInfo = await Promise.all(comments.map(async (comment: any) => {
      const author = await userRepository.findById(comment.author_id);
      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at, // Map created_at to createdAt
        sender: author ? {
          id: author.id,
          nickname: author.nickname,
          avatar: author.avatar,
        } : null, // Ensure sender is an object or null
      };
    }));

    // Removed console.log('Fetched comments (transformed):', JSON.stringify(commentsWithAuthorInfo, null, 2));
    res.json(commentsWithAuthorInfo);
  } catch (error) {
    console.error('Get comments error:', error)
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

    if (post.author?.id !== req.user.id) {
      res.status(403).json({ message: 'Forbidden: You can only delete your own posts' })
      return
    }

    await postRepository.delete(postId)
    res.status(204).send() // No content on successful delete
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Poll vote
router.post('/:id/poll/vote', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const postId = req.params.id;
    const { optionIndex } = req.body;
    const userId = req.user.id;

    const post = await postRepository.findById(postId);

    if (!post || !post.poll) {
      res.status(404).json({ message: 'Post or poll not found' });
      return;
    }

    let poll = post.poll;

    // Initialize votes array if it doesn't exist
    if (!poll.votes) {
      poll.votes = [];
    }

    // Check if user has already voted
    if (poll.votes.includes(userId)) {
      res.status(400).json({ message: 'User already voted in this poll' });
      return;
    }

    // Ensure optionIndex is valid
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      res.status(400).json({ message: 'Invalid poll option' });
      return;
    }

    // Increment vote count for the selected option
    poll.options[optionIndex].votes = (poll.options[optionIndex].votes || 0) + 1;

    // Add user to the voted users list for this poll option
    if (!poll.options[optionIndex].voterIds) {
      poll.options[optionIndex].voterIds = [];
    }
    poll.options[optionIndex].voterIds.push(userId);

    // Add user to the overall poll voters list
    poll.votes.push(userId);

    await postRepository.update(postId, { poll });

    res.json(poll);
  } catch (error) {
    console.error('Poll vote error:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export const postRouter = router
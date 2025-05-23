import { Router, Request, Response } from 'express'
import { AppDataSource } from '../data-source'
import { Post } from '../entities/Post'
import { User } from '../entities/User'
import { authenticateToken } from '../middleware/auth'
import { In } from 'typeorm'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Comment } from '../entities/Comment'
import { Notification, NotificationType } from '../entities/Notification'

// Создаем папку uploads, если она не существует
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (_req: Express.Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir)
  },
  filename: (_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_') // Заменяем специальные символы на подчеркивания
    cb(null, `${uniqueSuffix}-${originalName}`)
  }
})

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'image/svg+xml',  // SVG
    'image/bmp',      // BMP
    'image/tiff',     // TIFF
    'image/x-icon',   // ICO
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ]
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF, ICO) and Excel files are allowed.'))
  }
}

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: User
}

const router = Router()
const postRepository = AppDataSource.getRepository(Post)
const userRepository = AppDataSource.getRepository(User)
const commentRepository = AppDataSource.getRepository(Comment)

// Create post
router.post('/', authenticateToken, upload.array('media'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    
    const content = req.body.content
    const pollData = req.body.poll ? JSON.parse(req.body.poll) : null
    const mediaFiles = (req.files as Express.Multer.File[]) || []
    const mediaUrls = mediaFiles.map(file => `/uploads/${file.filename}`)

    const user = await userRepository.findOne({
      where: { id: req.user.id },
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const post = postRepository.create({
      content,
      media: mediaUrls,
      poll: pollData,
      author: user,
    })

    await postRepository.save(post)

    // Возвращаем только нужные поля автора
    res.status(201).json({
      ...post,
      author: {
        id: user.id,
        username: user.nickname,
        avatar: user.avatar,
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
      console.log('Unauthorized request - no user in request')
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    console.log('Fetching feed for user:', req.user.id)

    const user = await userRepository.findOne({
      where: { id: req.user.id },
      relations: ['following'],
    })

    if (!user) {
      console.log('User not found:', req.user.id)
      res.status(404).json({ message: 'User not found' })
      return
    }

    const followingIds = user.following.map((followedUser) => followedUser.id)
    followingIds.push(user.id) // Include user's own posts

    console.log('Fetching posts for users:', followingIds)

    const posts = await postRepository.find({
      where: {
        author: {
          id: In(followingIds),
        },
      },
      relations: ['author', 'likes', 'retweets', 'comments'],
      order: {
        createdAt: 'DESC',
      },
      take: 20,
    })

    console.log('Found posts count:', posts.length)
    if (posts.length > 0) {
      console.log('Sample post author:', JSON.stringify(posts[0].author, null, 2))
    }

    // Возвращаем только нужные поля автора и лайков
    const formattedPosts = posts.map(post => {
      if (!post.author) {
        console.log('Post without author:', post)
        return null
      }
      const formattedPost = {
        ...post,
        author: {
          id: post.author.id,
          nickname: post.author.nickname,
          avatar: post.author.avatar,
        },
        likes: post.likes.map(like => like.id), // Возвращаем только id пользователей, поставивших лайк
      }
      console.log('Formatted post:', JSON.stringify(formattedPost, null, 2))
      return formattedPost
    }).filter(Boolean)

    console.log('Formatted posts count:', formattedPosts.length)
    if (formattedPosts.length > 0) {
      console.log('Sample formatted post:', JSON.stringify(formattedPosts[0], null, 2))
    }

    res.json(formattedPosts)
  } catch (error) {
    console.error('Get feed error:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Получить посты текущего пользователя
router.get('/user/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const posts = await postRepository.find({
      where: {
        author: { id: req.user.id },
      },
      relations: ['author', 'likes', 'retweets', 'comments'],
      order: { createdAt: 'DESC' },
    });
    res.json(posts.map(post => ({
      ...post,
      author: {
        id: post.author.id,
        nickname: post.author.nickname,
        avatar: post.author.avatar,
      },
      retweetsCount: post.retweets.length,
      commentsCount: post.comments.length,
      isLiked: post.likes.some(like => like.id === req.user?.id)
    })));
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ message: 'Internal server error', error: error && error.toString ? error.toString() : JSON.stringify(error) });
  }
});

// Получить посты по id пользователя
router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await postRepository.find({
      where: {
        author: {
          id: req.params.userId,
        },
      },
      relations: ['author', 'likes', 'retweets', 'comments'],
      order: {
        createdAt: 'DESC',
      },
    });
    res.json(posts.map(post => ({
      ...post,
      author: {
        id: post.author.id,
        nickname: post.author.nickname,
        avatar: post.author.avatar,
      },
      retweetsCount: post.retweets.length,
      commentsCount: post.comments.length,
    })));
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Like post
router.post('/:id/like', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const post = await postRepository.findOne({
      where: { id: req.params.id },
      relations: ['author', 'likes']
    })

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    const user = await userRepository.findOne({
      where: { id: req.user.id }
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const isLiked = post.likes.some(like => like.id === user.id)

    if (isLiked) {
      post.likes = post.likes.filter(like => like.id !== user.id)
    } else {
      post.likes.push(user)
      
      // Create notification for like
      if (post.author.id !== user.id) {
        const notification = new Notification()
        notification.type = NotificationType.LIKE
        notification.recipient = post.author
        notification.actor = user
        notification.post = post
        notification.isRead = false
        await AppDataSource.getRepository(Notification).save(notification)
      }
    }

    await postRepository.save(post)

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: !isLiked
    })
  } catch (error) {
    console.error('Like post error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Delete post
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const postId = req.params.id;
    const post = await postRepository.findOne({
      where: { id: postId },
      relations: ['author'],
    });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (post.author.id !== req.user.id) {
      res.status(403).json({ message: 'Forbidden: You can only delete your own posts' });
      return;
    }

    await postRepository.remove(post);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Retweet post
router.post('/:id/retweet', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const post = await postRepository.findOne({
      where: { id: req.params.id },
      relations: ['author', 'retweets']
    })

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    const user = await userRepository.findOne({
      where: { id: req.user.id }
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const isRetweeted = post.retweets.some(retweet => retweet.id === user.id)

    if (isRetweeted) {
      post.retweets = post.retweets.filter(retweet => retweet.id !== user.id)
    } else {
      post.retweets.push(user)
      
      // Create notification for retweet
      if (post.author.id !== user.id) {
        const notification = new Notification()
        notification.type = NotificationType.RETWEET
        notification.recipient = post.author
        notification.actor = user
        notification.post = post
        notification.isRead = false
        await AppDataSource.getRepository(Notification).save(notification)
      }
    }

    await postRepository.save(post)

    res.json({
      message: isRetweeted ? 'Post unretweeted' : 'Post retweeted',
      retweetsCount: post.retweets.length,
      isRetweeted: !isRetweeted
    })
  } catch (error) {
    console.error('Retweet post error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Add comment
router.post('/:id/comments', authenticateToken, upload.single('media'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const post = await postRepository.findOne({
      where: { id: req.params.id },
      relations: ['author']
    })

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    const user = await userRepository.findOne({
      where: { id: req.user.id }
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const comment = new Comment()
    comment.content = req.body.content
    comment.author = user
    comment.post = post

    if (req.file) {
      comment.media = `/uploads/${req.file.filename}`
    }

    await commentRepository.save(comment)
    
    // Create notification for comment
    if (post.author.id !== user.id) {
      const notification = new Notification()
      notification.type = NotificationType.COMMENT
      notification.recipient = post.author
      notification.actor = user
      notification.post = post
      notification.comment = comment
      notification.isRead = false
      await AppDataSource.getRepository(Notification).save(notification)
    }

    res.json({
      message: 'Comment added',
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar
        }
      }
    })
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get comments for post
router.get('/:id/comments', async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await postRepository.findOne({ where: { id: req.params.id } })
    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }
    const comments = await commentRepository.find({
      where: { post: { id: post.id } },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    })
    res.json(comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.author.id,
        nickname: comment.author.nickname,
        avatar: comment.author.avatar,
      },
      createdAt: comment.createdAt,
    })))
  } catch (error) {
    console.error('Get comments error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Like comment
router.post('/comments/:id/like', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const comment = await commentRepository.findOne({ where: { id: req.params.id }, relations: ['likes'] })
    const user = await userRepository.findOne({ where: { id: req.user.id } })
    if (!comment || !user) {
      res.status(404).json({ message: 'Comment or user not found' })
      return
    }
    const hasLiked = comment.likes.some((like) => like.id === user.id)
    if (hasLiked) {
      comment.likes = comment.likes.filter((like) => like.id !== user.id)
      comment.likesCount -= 1
    } else {
      comment.likes.push(user)
      comment.likesCount += 1
    }
    await commentRepository.save(comment)
    res.json({
      message: hasLiked ? 'Comment unliked' : 'Comment liked',
      likesCount: comment.likesCount,
    })
  } catch (error) {
    console.error('Like comment error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get all posts
router.get('/all', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const posts = await postRepository.find({
      relations: ['author', 'likes', 'retweets', 'comments'],
      order: {
        createdAt: 'DESC',
      },
      take: 50, // Ограничиваем количество постов для производительности
    })

    // Форматируем посты для ответа
    const formattedPosts = posts.map(post => ({
      ...post,
      author: {
        id: post.author.id,
        nickname: post.author.nickname,
        avatar: post.author.avatar,
      },
      likes: post.likes.map(like => like.id),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      retweetsCount: post.retweets.length,
      isLiked: post.likes.some(like => like.id === req.user?.id),
      isRetweeted: post.retweets.some(retweet => retweet.id === req.user?.id),
    }))

    res.json(formattedPosts)
  } catch (error) {
    console.error('Get all posts error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Download file
router.get('/download/:filename', async (req: Request, res: Response): Promise<void> => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      res.status(404).json({ message: 'File not found' });
      return;
    }

    // Отправляем файл для скачивания
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Vote in poll
router.post('/:id/poll/vote', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id; // Extract userId here

    const post = await postRepository.findOne({
      where: { id: req.params.id }
    });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Ensure post.poll and post.poll.options are valid
    if (!post.poll || !Array.isArray(post.poll.options)) {
      res.status(400).json({ message: 'This post does not have a poll or poll options are invalid' });
      return;
    }

    const { optionIndex } = req.body;
    if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex >= post.poll.options.length) {
      res.status(400).json({ message: 'Invalid option index' });
      return;
    }

    // Find if the user has already voted for any option and get the index of the previous vote
    let previousVoteIndex: number | null = null;

    for (let i = 0; i < post.poll.options.length; i++) {
        const option = post.poll.options[i];
         // Ensure voterIds exists and is an array before checking includes
        if (Array.isArray(option.voterIds) && option.voterIds.includes(userId)) {
            previousVoteIndex = i;
            break; // User found, exit the loop
        }
    }

    // If user voted for the same option again, it's a cancellation
    if (previousVoteIndex !== null && previousVoteIndex === optionIndex) {
        res.status(200).json({ message: 'Attempting to cancel vote', action: 'cancel', poll: post.poll });
        return;
    }

    // If user voted for a different option after already voting - it's changing the vote
    if (previousVoteIndex !== null && previousVoteIndex !== optionIndex) {
         const previousOption = post.poll.options[previousVoteIndex];
         // Remove vote from the previous option
         if (Array.isArray(previousOption.voterIds)) {
             previousOption.voterIds = previousOption.voterIds.filter(id => id !== userId);
         }
         previousOption.votes = Math.max(0, previousOption.votes - 1); // Decrease count, prevent going below zero
    }

     // Add vote to the new option
    const currentOption = post.poll.options[optionIndex];
    // Initialize voterIds if undefined or null
    if (!Array.isArray(currentOption.voterIds)) {
        currentOption.voterIds = [];
    }
    // Add userId only if not already present
    if (!currentOption.voterIds.includes(userId)) {
        currentOption.voterIds.push(userId);
        currentOption.votes += 1; // Increase count
    }

    // Update the general votes array (optional, depending on if it's still used elsewhere)
    // Ensure post.poll.votes is an array
    if (!Array.isArray(post.poll.votes)) {
        post.poll.votes = [];
    }
    // Add user to general votes if not already present
    if (!post.poll.votes.includes(userId)) {
        post.poll.votes.push(userId);
    }

    await postRepository.save(post);

    // Fetch the updated post to get the latest poll data after saving
    const updatedPost = await postRepository.findOne({
         where: { id: req.params.id }
    });

    res.json({
      message: previousVoteIndex !== null ? 'Vote updated successfully' : 'Vote recorded successfully',
      poll: updatedPost?.poll, // Send updated poll data
      // hasVoted status can be determined on the client based on poll.votes or poll.options.voterIds
    });
  } catch (error) {
    console.error('Vote in poll error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel vote in poll
router.post('/:id/poll/cancel-vote', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;

    const post = await postRepository.findOne({
      where: { id: req.params.id }
    });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Ensure post.poll and post.poll.options are valid
    if (!post.poll || !Array.isArray(post.poll.options)) {
      res.status(400).json({ message: 'This post does not have a poll or poll options are invalid' });
      return;
    }

    // Find the option the user voted for
    let votedOptionIndex: number | null = null;
    for (let i = 0; i < post.poll.options.length; i++) {
        const option = post.poll.options[i];
        // Ensure voterIds exists and is an array before checking includes
        if (Array.isArray(option.voterIds) && option.voterIds.includes(userId)) {
            votedOptionIndex = i;
            break; // User found, exit the loop
        }
    }

    // If user has not voted for any option, they cannot cancel
    if (votedOptionIndex === null) {
       res.status(400).json({ message: 'You have not voted in this poll.' });
       return;
    }

    // Remove vote from the option
    const votedOption = post.poll.options[votedOptionIndex];
    if (Array.isArray(votedOption.voterIds)) {
       votedOption.voterIds = votedOption.voterIds.filter(id => id !== userId);
    }
    votedOption.votes = Math.max(0, votedOption.votes - 1); // Decrease count, prevent going below zero

    // Remove user from the general votes array (optional)
    if (Array.isArray(post.poll.votes)) {
        post.poll.votes = post.poll.votes.filter(id => id !== userId);
    }

    await postRepository.save(post);

    // Fetch the updated post to get the latest poll data after saving
    const updatedPost = await postRepository.findOne({
         where: { id: req.params.id }
    });

    res.json({
      message: 'Vote cancelled successfully',
      poll: updatedPost?.poll, // Send updated poll data
      // hasVoted status can be determined on the client based on poll.votes or poll.options.voterIds
    });
  } catch (error) {
    console.error('Cancel vote error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const postRouter = router
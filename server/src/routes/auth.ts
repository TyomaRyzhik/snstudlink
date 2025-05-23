import { Router, Request, Response } from 'express'
import { hash, compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { AppDataSource } from '../data-source'
import { User } from '../entities/User'
import { authenticateToken } from '../middleware/auth'

const router = Router()
const userRepository = AppDataSource.getRepository(User)

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, nickname, group, about } = req.body

    // Check if user exists
    const existingUser = await userRepository.findOne({
      where: [{ email }, { nickname }],
    })

    if (existingUser) {
      res.status(400).json({
        message: 'User with this email or nickname already exists',
      })
      return
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = userRepository.create({
      name,
      email,
      password: hashedPassword,
      nickname,
      group,
      about,
    })

    await userRepository.save(user)

    // Generate token
    const token = sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: '7d',
      }
    )

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
        group: user.group,
        about: user.about,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await userRepository.findOne({
      where: { email },
    })

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    // Check password
    const isValidPassword = await compare(password, user.password)

    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    // Generate token
    const token = sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: '7d',
      }
    )

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
        group: user.group,
        about: user.about,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Verify token and return user
router.get('/verify', authenticateToken, (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  res.json({ user: req.user });
});

export const authRouter = router 
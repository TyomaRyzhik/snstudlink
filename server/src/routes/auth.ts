import { Router, Request, Response } from 'express'
import { hash, compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { UserRepository } from '../repositories/UserRepository'
import { authenticateToken } from '../middleware/auth'

const router = Router()
const userRepository = new UserRepository()

const JWT_SECRET = process.env.JWT_SECRET || '2486acf3edba9e5c5229a13e551f09020cd1d765806e47405f67ecd85f150700'; // Use a constant for clarity

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, nickname, email, password, user_group } = req.body

    // Логируем входящие данные для отладки
    console.log('Регистрация:', { name, nickname, email, user_group });

    // Check if user exists
    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) {
      res.status(400).json({
        message: 'User with this email already exists',
      })
      return
    }

    // Check if nickname is taken
    const existingNickname = await userRepository.findByNickname(nickname)
    if (existingNickname) {
      res.status(400).json({
        message: 'This nickname is already taken',
      })
      return
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await userRepository.create({
      name,
      nickname,
      email,
      password: hashedPassword,
      user_group,
    })

    // Generate token
    const token = sign(
      { id: user.id },
      JWT_SECRET,
      {
        expiresIn: '7d',
        algorithm: 'HS256'
      }
    )

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        user_group: user.user_group,
        role: user.role?.name
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error', error: error.toString() })
  }
})

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await userRepository.findByEmail(email)
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
      JWT_SECRET,
      {
        expiresIn: '7d',
        algorithm: 'HS256'
      }
    )

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        user_group: user.user_group,
        role: user.role?.name
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error', error: error.toString() })
  }
})

// Verify token and return user
router.get('/verify', authenticateToken, (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  res.json({ 
    success: true, 
    user: {
      id: req.user.id,
      role: req.user.role
    }
  })
})

export const authRouter = router 
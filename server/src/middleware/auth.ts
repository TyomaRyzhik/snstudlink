import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
import { AppDataSource } from '../data-source'
import { User } from '../entities/User'

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || '2486acf3edba9e5c5229a13e551f09020cd1d765806e47405f67ecd85f150700';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      res.status(401).json({ message: 'Authentication required' })
      return
    }

    const decoded = verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as { id: string }
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { id: decoded.id } })

    if (!user) {
      res.status(403).json({ message: 'User not found' })
      return
    }

    req.user = { id: user.id }
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(403).json({ 
      message: 'Invalid token', 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return
  }
} 
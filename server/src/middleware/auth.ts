import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
import { User } from '../entities/User'
import { AppDataSource } from '../data-source'

declare module 'express-serve-static-core' {
  interface Request {
    user?: User
  }
}

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

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string }
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { id: decoded.id } })

    if (!user) {
      res.status(403).json({ message: 'User not found' })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' })
    return
  }
} 
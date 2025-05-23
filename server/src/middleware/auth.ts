import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
import { UserRepository } from '../db/repositories/user.repository'

declare module 'express-serve-static-core' {
  interface Request {
    user?: any
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
    const userRepository = new UserRepository()
    const user = await userRepository.findById(decoded.id)

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
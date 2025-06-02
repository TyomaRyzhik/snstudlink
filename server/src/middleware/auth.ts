import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
import { AppDataSource } from '../data-source'
import { User } from '../entities/User'

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string, role?: string }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || '2486acf3edba9e5c5229a13e551f09020cd1d765806e47405f67ecd85f150700';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Temporary log to check authorization header
    console.log('Authorization Header:', req.headers['authorization']);

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      console.log('No token provided'); // Log if no token
      res.status(401).json({ message: 'Authentication required' })
      return
    }

    // Temporary log before verification
    console.log('Token received, attempting verification...');

    const decoded = verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as { id: string }
    
    // Temporary log after successful verification
    console.log('Token verified, decoded ID:', decoded.id);

    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { id: decoded.id }, relations: ['role'] })

    if (!user) {
      console.log('User not found after token verification'); // Log if user not found
      res.status(403).json({ message: 'User not found' })
      return
    }

    req.user = { id: user.id, role: user.role?.name }
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
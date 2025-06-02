import { Response, NextFunction } from 'express';
import { UserRole } from '../types/database'; // Assuming UserRole is defined here
import { AuthenticatedRequest } from '../types'; // Assuming AuthenticatedRequest is defined here

export const authorizeRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Temporary log to check user role and allowed roles in RBAC middleware
    console.log('RBAC Check - User Role:', req.user?.role);
    console.log('RBAC Check - Allowed Roles:', roles);

    // Check if user is authenticated and has a role
    if (!req.user || !req.user.role) {
      console.log('RBAC Check - Access Denied: No user or role');
      res.status(403).json({ message: 'Access denied. No role assigned.' });
      return;
    }

    // Check if the user's role is included in the allowed roles for this route
    if (!roles.includes(req.user.role as UserRole)) {
      console.log('RBAC Check - Access Denied: Insufficient role', req.user.role);
      res.status(403).json({ message: 'Access denied. Insufficient role.' });
      return;
    }

    console.log('RBAC Check - Access Granted');
    next();
  };
}; 
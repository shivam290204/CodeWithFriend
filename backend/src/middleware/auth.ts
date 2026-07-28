import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export const optionalAuth = (req: any, res: any, next: any) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {}
  }
  next();
};

export const requireAuth = (req: any, res: any, next: any) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e: any) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

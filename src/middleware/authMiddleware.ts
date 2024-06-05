import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';

interface JwtPayload {
  id: number;
  role: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    userId?: number;
    userRole?: string;
  }
}

const getTokenFromAuthHeader = (req: Request) => {
  const authHeaderName = 'Authorization';
  const authHeaderValue = req.get(authHeaderName);
  const token = authHeaderValue?.match(/Bearer (.*)/)?.[1];
  return token || undefined;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = getTokenFromAuthHeader(req) as string;
  if (!token) {
    res.status(403).json({ error: 'No token provided' });
    return;
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      res.status(500).json({ error: 'Failed to authenticate token' });
      return;
    }
    const decodedToken = decoded as JwtPayload;
    req.userId = decodedToken.id;
    req.userRole = decodedToken.role;
    next();
  });
};

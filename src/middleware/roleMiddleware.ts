import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.userRole)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    next();
  };
};

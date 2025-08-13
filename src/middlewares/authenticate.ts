import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { ENV } from '../config';
import { ErrorMessages } from '../constants';

export const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: ErrorMessages.UNAUTHORIZED });
  }

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, ENV.JWT.SECRET_KEY) as any;
    req.user = {
      id: payload.id,
      username: payload.username,
      isAdmin: payload.isAdmin,
    };
    
    return next();
  } catch (err: any) {
    return res.status(401).json({ message: ErrorMessages.UNAUTHORIZED });
  }
};
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { ENV } from '../config';
import { UnauthorizedError } from '../errors';
import { ErrorMessages } from '../constants';

export const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return next(new UnauthorizedError());
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
  }
  catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError(ErrorMessages.ACCESS_TOKEN_EXPIRED));
    }
    return next(new UnauthorizedError());
  }
};
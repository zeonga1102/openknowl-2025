import { NextFunction, Request, Response } from 'express';
import { EntityManager, RequestContext } from '@mikro-orm/postgresql';

import { createUser, loginUser } from '../services/userService';
import { ENV } from '../config';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager() as EntityManager;
    const user = await createUser(em, req.body);

    return res.status(201).json(user);
  }
  catch (err: any) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager() as EntityManager;
    const token = await loginUser(em, req.body);

    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ENV.COOKIE.MAX_AGE
    });

    return res.status(201).json({ accessToken: token.accessToken });
  }
  catch (err: any) {
    next(err);
  }
};
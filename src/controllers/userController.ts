import { NextFunction, Request, Response } from 'express';
import { EntityManager, RequestContext } from '@mikro-orm/postgresql';

import { createUser, loginUser } from '../services/userService';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager() as EntityManager;
    const user = await createUser(em, req.body);

    const { password, ...newUser } = user;
    res.status(201).json(newUser);
  }
  catch (err: any) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager() as EntityManager;
    const accessToken = await loginUser(em, req.body);

    res.status(201).json(accessToken);
  }
  catch (err: any) {
    next(err);
  }
};
import { Request, Response } from 'express';
import { EntityManager, RequestContext } from '@mikro-orm/postgresql';

import { createUser, loginUser } from '../services/userService';
import { BaseError } from '../errors';
import { ErrorMessages } from '../constants';

export const signup = async (req: Request, res: Response) => {
  try {
    const em = RequestContext.getEntityManager() as EntityManager;
    const user = await createUser(em, req.body);

    const { password, ...newUser } = user;
    res.status(201).json(newUser);
  }
  catch (err: any) {
    if (err instanceof BaseError) {
      res.status(err.statusCode).json({ message: err.message });
    }
    else {
      res.status(500).json({ message:  ErrorMessages.UNHANDLED_ERROR });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const em = RequestContext.getEntityManager() as EntityManager;
    const accessToken = await loginUser(em, req.body);

    res.status(201).json(accessToken);
  }
  catch (err: any) {
    if (err instanceof BaseError) {
      res.status(err.statusCode).json({ message: err.message });
    }
    else {
      res.status(500).json({ message:  ErrorMessages.UNHANDLED_ERROR });
    }
  }
};
import { Request, Response } from 'express';

import { createUser, loginUser } from '../services/userService';
import { EntityManager, RequestContext } from '@mikro-orm/postgresql';

export const signup = async (req: Request, res: Response) => {
  try {
    const em = RequestContext.getEntityManager() as EntityManager;
    const user = await createUser(em, req.body);

    const { password, ...newUser } = user;
    res.status(201).json(newUser);
  }
  catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const em = RequestContext.getEntityManager() as EntityManager;
    const accessToken = await loginUser(em, req.body);

    res.status(201).json(accessToken);
  }
  catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};
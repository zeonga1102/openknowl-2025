import { Request, Response } from 'express';

import { createUser } from '../services/userService';
import { EntityManager, RequestContext } from '@mikro-orm/postgresql';

export const signup = async (req: Request, res: Response) => {
  try {
    const em = RequestContext.getEntityManager() as EntityManager;
    const user = await createUser(em, req.body);

    const { password, ...safeUser } = user;
    res.status(201).json(safeUser);
  }
  catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

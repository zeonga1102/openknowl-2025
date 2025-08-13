import { NextFunction, Request, Response } from 'express';
import { EntityManager, RequestContext } from '@mikro-orm/postgresql';

import { createMClass } from '../services/mclassService';
import { assertAdmin } from '../utils/permissions';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    assertAdmin(req.user);

    const em = RequestContext.getEntityManager() as EntityManager;
    const mclass = await createMClass(em, req.body, req.user!);

    return res.status(201).json(mclass);
  }
  catch (err: any) {
    next(err);
  }
};

import { Request, Response, NextFunction } from 'express';
import { EntityManager, RequestContext } from '@mikro-orm/postgresql';

import { getMyApplicationList } from '../services/applicationService';

export const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager() as EntityManager;
    const applicationList = await getMyApplicationList(em, req.validatedQuery, req.user!);

    return res.json({ list: applicationList });
  }
  catch (err) {
    next(err);
  }
};
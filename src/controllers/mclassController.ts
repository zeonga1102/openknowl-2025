import { NextFunction, Request, Response } from 'express';
import { EntityManager, RequestContext } from '@mikro-orm/postgresql';

import { createMClass, getMClassList } from '../services/mclassService';
import { assertAdmin } from '../utils/permissions';
import { DefaultLimits } from '../constants';

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

export const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager() as EntityManager;

    const limit = req.query.limit ? Number(req.query.limit) : DefaultLimits.MCLASS;
    const last = req.query.last ? Number(req.query.last) : undefined;

    const mclassList = await getMClassList(em, limit, last);

    return res.json({ list: mclassList });
  } catch (err: any) {
    next(err);
  }
};
import { NextFunction, Request, Response } from 'express';
import { EntityManager, RequestContext } from '@mikro-orm/postgresql';

import { createMClass, getMClassById, getMClassList, deleteMClassById } from '../services/mclassService';
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

export const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager() as EntityManager;
    const mclassList = await getMClassList(em, req.validatedQuery!);

    return res.json({ list: mclassList });
  }
  catch (err: any) {
    next(err);
  }
};

export const getDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager() as EntityManager;
    const mclass = await getMClassById(em, Number(req.params.id));

    return res.json(mclass);
  }
  catch (err: any) {
    next(err);
  }
};

export const deleteMclass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    assertAdmin(req.user);

    const em = RequestContext.getEntityManager() as EntityManager;
    const deletedId = await deleteMClassById(em, Number(req.params.id));

    return res.json({ id: deletedId });
  }
  catch (err: any) {
    next(err);
  }
};
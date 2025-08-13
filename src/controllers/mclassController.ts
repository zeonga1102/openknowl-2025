import { Request, Response } from 'express';
import { EntityManager, RequestContext } from '@mikro-orm/postgresql';

import { createMClass } from '../services/mclassService';
import { assertAdmin } from '../utils/permissions';
import { ErrorMessages } from '../constants/error-messages';

export const create = async (req: Request, res: Response) => {
  try {
    assertAdmin(req.user);

    const em = RequestContext.getEntityManager() as EntityManager;
    const mclass = await createMClass(em, req.body, req.user!);

    return res.status(201).json(mclass);
  } catch (err: any) {
    if (err.message === ErrorMessages.FORBIDDEN) {
      return res.status(403).json({ message: err.message });
    }
    
    return res.status(400).json({ message: err.message });
  }
};

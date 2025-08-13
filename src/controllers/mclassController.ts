import { Request, Response } from 'express';
import { EntityManager, RequestContext } from '@mikro-orm/postgresql';

import { createMClass } from '../services/mclassService';
import { assertAdmin } from '../utils/permissions';
import { ErrorMessages } from '../constants';
import { BaseError } from '../errors';

export const create = async (req: Request, res: Response) => {
  try {
    assertAdmin(req.user);

    const em = RequestContext.getEntityManager() as EntityManager;
    const mclass = await createMClass(em, req.body, req.user!);

    return res.status(201).json(mclass);
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

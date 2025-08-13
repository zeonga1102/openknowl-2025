import { Request, Response, NextFunction } from 'express';

import { BaseError } from '../errors';
import { ErrorMessages } from '../constants';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  res.status(500).json({ message: ErrorMessages.UNHANDLED_ERROR });
}
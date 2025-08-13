import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

import { ErrorMessages } from '../constants';

export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const instance = plainToInstance(dtoClass, req.body);
    const errors = await validate(instance);

    if (errors.length > 0) {
      return res.status(400).json({
        message: ErrorMessages.VALIDATION_FAILED,
        errors: errors.map((e) => ({
          field: e.property,
          constraints: e.constraints,
        }))
      });
    }

    req.body = instance;
    next();
  };
};
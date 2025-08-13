import { UserPayload } from '../dtos';
import { ErrorMessages } from '../constants';
import { ForbiddenError } from '../errors';

export function assertAdmin(user?: UserPayload) {
  if (!user || !user.isAdmin) {
    throw new ForbiddenError(ErrorMessages.FORBIDDEN);
  }
}
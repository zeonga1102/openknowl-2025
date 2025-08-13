import { UserPayload } from '../dtos';
import { ErrorMessages } from '../constants';

export function assertAdmin(user?: UserPayload) {
  if (!user || !user.isAdmin) {
    throw new Error(ErrorMessages.FORBIDDEN);
  }
}
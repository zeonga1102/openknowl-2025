import { UserPayload } from '../dtos/UserPayload';
import { ErrorMessages } from '../constants/error-messages';

export function assertAdmin(user?: UserPayload) {
  if (!user || !user.isAdmin) {
    throw new Error(ErrorMessages.FORBIDDEN);
  }
}
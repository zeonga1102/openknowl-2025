import { EntityManager } from '@mikro-orm/postgresql';

import { CreateMClassDto, UserPayload } from '../dtos';
import { User, MClass } from '../entities';
import { ErrorMessages } from '../constants';
import { ValidationError } from '../errors';

export async function createMClass(em: EntityManager, data: CreateMClassDto, requestUser: UserPayload) {
  const deadline = new Date(data.deadline);
  const startAt = new Date(data.startAt);
  const endAt = new Date(data.endAt);
  validateDate(deadline, startAt, endAt);

  const userRef = em.getReference(User, requestUser.id);

  const repo = em.getRepository(MClass);

  const mclass = new MClass();
  mclass.title = data.title;
  mclass.description = data.description;
  mclass.maxPeople = data.maxPeople;
  mclass.deadline = deadline;
  mclass.startAt = startAt;
  mclass.endAt = endAt;
  mclass.fee = data.fee;
  mclass.createdUser = userRef;

  repo.create(mclass);
  await em.flush();

  return mclass;
}

function validateDate(deadline: Date, startAt: Date, endAt: Date) {
  const now = new Date();
  // 마감 시간 및 시작 시간은 현재 시간보다 커야 함
  if (deadline <= now || startAt <= now) {
    throw new ValidationError(ErrorMessages.WRONG_DATE);
  }

  // 시작일시는 마감 시간보다 커야 함
  if (startAt <= deadline) {
    throw new ValidationError(ErrorMessages.WRONG_DATE);
  }

  // 종료일시는 시작일시보다 커야 함
  if (endAt <= startAt) {
    throw new ValidationError(ErrorMessages.WRONG_DATE);
  }
}
import { EntityManager, QueryOrder } from '@mikro-orm/postgresql';
import { plainToInstance } from 'class-transformer';

import { CreateMClassDto, UserPayload, MClassListItemDto, GetMClassListQueryDto, MClassDetailDto } from '../dtos';
import { User, MClass } from '../entities';
import { ErrorMessages } from '../constants';
import { ValidationError, NotFoundError } from '../errors';

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

export async function getMClassList(em: EntityManager, data: GetMClassListQueryDto) {
  const repo = em.getRepository(MClass);

  const where = data.last ? { id: { $lt: data.last }} : {};
  const mclassList = await repo.find(where, { orderBy: { id: QueryOrder.DESC }, limit: data.limit });

  return plainToInstance(MClassListItemDto, mclassList, { excludeExtraneousValues: true });
}

export async function getMClassById(em: EntityManager, id: number) {
  const repo = em.getRepository(MClass);

  const mclass = await repo.findOne({ id: id });
  if (!mclass) {
    throw new NotFoundError();
  }

  return plainToInstance(MClassDetailDto, mclass, { excludeExtraneousValues: true });
}

export async function deleteMClassById(em: EntityManager, id: number) {
  const repo = em.getRepository(MClass);

  const mclass = await repo.findOne({
    $and: [
      { id: id },
      { isDelete: false }
    ]}
  );
  if (!mclass) {
    throw new NotFoundError();
  }

  mclass.isDelete = true;
  await em.flush();

  return mclass.id;
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
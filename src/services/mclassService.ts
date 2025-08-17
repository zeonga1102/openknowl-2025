import { EntityManager, EntityRepository, LockMode, QueryOrder } from '@mikro-orm/postgresql';
import { plainToInstance } from 'class-transformer';

import { CreateMClassDto, UserPayload, MClassListItemDto, GetListQueryDto, MClassDetailDto, CreateMClassResponseDto } from '../dtos';
import { User, MClass, Application } from '../entities';
import { ErrorMessages } from '../constants';
import { ValidationError, NotFoundError, ConflictError, ForbiddenError } from '../errors';

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

  return plainToInstance(CreateMClassResponseDto, mclass, { excludeExtraneousValues: true });
}

export async function getMClassList(em: EntityManager, data: GetListQueryDto) {
  const repo = em.getRepository(MClass);

  const mclassList = await repo.find(
    { ...(data.last ? {id: { $lt: data.last }} : {}), isDelete: false },
    { orderBy: { id: QueryOrder.DESC }, limit: data.limit }
  );

  return plainToInstance(MClassListItemDto, mclassList, { excludeExtraneousValues: true });
}

export async function getMClassById(em: EntityManager, id: number) {
  const repo = em.getRepository(MClass);

  const mclass = await repo.findOne({ id: id, isDelete: false });
  if (!mclass) {
    throw new NotFoundError();
  }

  return plainToInstance(MClassDetailDto, mclass, { excludeExtraneousValues: true });
}

export async function deleteMClassById(em: EntityManager, id: number) {
  const mclassRepo = em.getRepository(MClass);
  const appRepo = em.getRepository(Application);

  const mclass = await mclassRepo.findOne({ id: id, isDelete: false });
  if (!mclass) {
    throw new NotFoundError();
  }

  const count = await appRepo.count({ mclass });
  if (count) {
    throw new ConflictError(ErrorMessages.MCLASS_HAS_APPLICATION);
  }

  mclass.isDelete = true;
  await em.flush();

  return mclass.id;
}

export async function applyToMClass(em: EntityManager, id: number, requestUser: UserPayload) {
  const appRepo = em.getRepository(Application);

  await em.begin();

  try {
    const mclass = await em.findOne(
      MClass,
      { id: id, isDelete: false },
      { lockMode: LockMode.PESSIMISTIC_WRITE }
    );
    
    await assertApplication(appRepo, mclass, requestUser.id);

    const application = new Application();
    application.mclass = mclass!;
    application.user = em.getReference(User, requestUser.id);

    appRepo.create(application);
    await em.commit();
    
    return application.id;
  }
  catch (err: any) {
    await em.rollback();
    throw err;
  }
}

async function assertApplication(appRepo: EntityRepository<Application>, mclass: MClass | null, userId: number) {
  const now = new Date();

  // 존재하지 않는 M클래스
  if (!mclass) {
    throw new NotFoundError();
  }

  // 본인이 만든 M클래스
  if (mclass.createdUser.id == userId) {
    throw new ForbiddenError(ErrorMessages.CAN_NOT_APPLY_TO_OWN_MCLASS);
  }

  // 이미 신청한 M클래스
  const application = await appRepo.findOne({ mclass: mclass, user: userId });
  if (application) {
    throw new ConflictError(ErrorMessages.ALREADY_APPLY);
  }

  // 마감 시간 초과
  if (mclass.deadline <= now) {
    throw new ConflictError(ErrorMessages.DEADLINE_OVER);
  }

  // 정원 초과
  const currentCount = await appRepo.count({ mclass: mclass });
  if (currentCount >= mclass.maxPeople) {
    throw new ConflictError(ErrorMessages.MAX_PEOPLE_EXCESS);
  }
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
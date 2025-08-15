import { EntityManager, PopulateHint, QueryOrder } from '@mikro-orm/postgresql';
import { plainToInstance } from 'class-transformer';

import { Application } from '../entities';
import { ApplicationListItemDto, GetListQueryDto, UserPayload } from '../dtos';

export async function getMyApplicationList(em: EntityManager, data: GetListQueryDto, requestUser: UserPayload) {
  const repo = em.getRepository(Application);

  const applicationList = await repo.find(
    {
      user: requestUser.id,
      mclass: { ...(data.last ? {id: { $lt: data.last }} : {}), isDelete: false }
    },
    {
      populate: ['mclass'],
      populateWhere: PopulateHint.INFER,
      orderBy: { createdAt: QueryOrder.DESC },
      limit: data.limit
    }
  );

  return plainToInstance(ApplicationListItemDto, applicationList, { excludeExtraneousValues: true });
}
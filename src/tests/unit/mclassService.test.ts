import { EntityManager, EntityRepository, QueryOrder } from '@mikro-orm/postgresql';

import { createMClass, getMClassList } from '../../services/mclassService';
import { MClass } from '../../entities';
import { ErrorMessages } from '../../constants';

describe('createMClass unit test - M클래스 생성 관련 서비스 유닛 테스트', () => {
  let em: EntityManager;
  let mclassRepo: EntityRepository<MClass>;

  const requestUser = {
    id: 1,
    username: 'test',
    isAdmin: true
  };

  beforeEach(() => {
    mclassRepo = {
      create: jest.fn()
    } as unknown as EntityRepository<MClass>;

    em = {
      getReference: jest.fn(() => requestUser.id),
      getRepository: jest.fn(() => mclassRepo),
      flush: jest.fn()
    } as unknown as EntityManager;
  });

  it('mclass 저장 성공', async () => {
    const input = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };

    const result = await createMClass(em, input, requestUser);

    expect(result).toMatchObject({
      title: input.title,
      description: input.description,
      maxPeople: input.maxPeople,
      deadline: new Date(input.deadline),
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      fee: input.fee,
      createdUser: requestUser.id
    });
  });

  it('deadline이 과거인 경우 실패', async () => {
    const input = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() - 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };

    await expect(createMClass(em, input, requestUser)).rejects.toThrow(ErrorMessages.WRONG_DATE);
  });

  it('startAt이 과거인 경우 실패', async () => {
    const input = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };

    await expect(createMClass(em, input, requestUser)).rejects.toThrow(ErrorMessages.WRONG_DATE);
  });

  it('startAt이 deadline보다 작은 경우 실패', async () => {
    const input = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };

    await expect(createMClass(em, input, requestUser)).rejects.toThrow(ErrorMessages.WRONG_DATE);
  });

  it('endAt이 startAt보다 작은 경우 실패', async () => {
    const input = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      fee: 100
    };

    await expect(createMClass(em, input, requestUser)).rejects.toThrow(ErrorMessages.WRONG_DATE);
  });
});

describe('getMClassList unit test - M클래스 목록 조회 관련 서비스 유닛 테스트', () => {
  let em: EntityManager;
  let mclassRepo: EntityRepository<MClass>;

  const mclassListData = [{ id:1 }, { id: 2 }, { id: 3 }]

  beforeEach(() => {
    mclassRepo = {
      find: jest.fn(() => mclassListData)
    } as unknown as EntityRepository<MClass>;

    em = {
      getRepository: jest.fn(() => mclassRepo)
    } as unknown as EntityManager;
  });

  it('mclass 목록 조회 성공', async () => {
    const input = {
      limit: 10,
      last: 1
    }

    await getMClassList(em, input);

    expect(mclassRepo.find).toHaveBeenCalledWith({ id: { $lt: input.last } },{ orderBy: { id: QueryOrder.DESC },limit: input.limit });
  });

  it('last가 없는 경우 where 없이 mclass 목록 조회 성공', async () => {
    const input = {
      limit: 10,
      last: undefined
    }

    await getMClassList(em, input);

    expect(mclassRepo.find).toHaveBeenCalledWith({},{ orderBy: { id: QueryOrder.DESC },limit: input.limit });
  })
});
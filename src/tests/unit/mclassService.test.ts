import { EntityManager, EntityRepository, QueryOrder } from '@mikro-orm/postgresql';

import { createMClass, getMClassList, getMClassById, deleteMClassById } from '../../services/mclassService';
import { MClass } from '../../entities';
import { ErrorMessages } from '../../constants';
import { NotFoundError } from '../../errors';

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

    
    expect(mclassRepo.find).toHaveBeenCalledWith(
      { $and: [
        { id: { $lt: input.last }},
        { isDelete: false }
      ] },
      { orderBy: { id: QueryOrder.DESC }, limit: input.limit }
    );
  });

  it('last가 없는 경우 where 없이 mclass 목록 조회 성공', async () => {
    const input = {
      limit: 10,
      last: undefined
    }

    await getMClassList(em, input);

    expect(mclassRepo.find).toHaveBeenCalledWith({ isDelete: false },{ orderBy: { id: QueryOrder.DESC }, limit: input.limit });
  })
});

describe('getMClassById unit test - M클래스 상세 조회 관련 서비스 유닛 테스트', () => {
  let em: EntityManager;
  let mclassRepo: EntityRepository<MClass>;

  beforeEach(() => {
    mclassRepo = {
      findOne: jest.fn()
    } as unknown as EntityRepository<MClass>;

    em = {
      getRepository: jest.fn(() => mclassRepo)
    } as unknown as EntityManager;
  });

  it('mclass 상세 조회 성공', async () => {
    const mclassData = {
      id: 1,
      title: 'test',
      description: 'test description',
      maxPeople: 10,
      deadline: new Date(),
      startAt: new Date(),
      endAt: new Date(),
      fee: 100
    };
    (mclassRepo.findOne as jest.Mock).mockResolvedValue(mclassData);

    const result = await getMClassById(em, mclassData.id);

    expect(mclassRepo.findOne).toHaveBeenCalledWith({ $and: [{ id: mclassData.id }, { isDelete: false }] });
    expect(result).toEqual({
      id: mclassData.id,
      title: mclassData.title,
      description: mclassData.description,
      maxPeople: mclassData.maxPeople,
      deadline: mclassData.deadline,
      startAt: mclassData.startAt,
      endAt: mclassData.endAt,
      fee: mclassData.fee
    });
  });

  it('존재하지 않는 id인 경우 실패', async () => {
    (mclassRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(getMClassById(em, 1)).rejects.toThrow(NotFoundError);
  });
});

describe('deleteMclassById unit test - M클래스 삭제 관련 서비스 유닛 테스트', () => {
  let em: EntityManager;
  let mclassRepo: EntityRepository<MClass>;

  beforeEach(() => {
    mclassRepo = {
      findOne: jest.fn()
    } as unknown as EntityRepository<MClass>;

    em = {
      getRepository: jest.fn(() => mclassRepo),
      flush: jest.fn()
    } as unknown as EntityManager;
  });

  it('mclass 삭제 성공', async () => {
    const mclassData = { id: 1 };
    (mclassRepo.findOne as jest.Mock).mockResolvedValue(mclassData);

    const result = await deleteMClassById(em, mclassData.id);

    expect(result).toBe(mclassData.id);
  });

  it('존재하지 않거나 이미 삭제된 id인 경우 실패', async () => {
    (mclassRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(deleteMClassById(em, 1)).rejects.toThrow(NotFoundError);
  });
});
import { QueryOrder } from '@mikro-orm/postgresql';

import { createMClass, getMClassList, getMClassById, deleteMClassById, applyToMClass } from '../../services/mclassService';
import { MClass } from '../../entities';
import { ErrorMessages } from '../../constants';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../errors';

describe('createMClass unit test - M클래스 생성 관련 서비스 유닛 테스트', () => {
  let em: any;
  let mclassRepo: any;

  const requestUser = {
    id: 1,
    username: 'test',
    isAdmin: true
  };

  beforeEach(() => {
    mclassRepo = { create: jest.fn() };
    em = {
      getReference: jest.fn(() => requestUser.id),
      getRepository: jest.fn(() => mclassRepo),
      flush: jest.fn()
    };
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

    expect(result).toEqual({
      id: result.id,
      title: input.title,
      description: input.description,
      maxPeople: input.maxPeople,
      deadline: new Date(input.deadline),
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      fee: input.fee,
      createdAt: result.createdAt
    });
  });

  it('description이 없는 경우 mclass 저장 성공', async () => {
    const input = {
      title: 'test class',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };

    const result = await createMClass(em, input, requestUser);

    expect(result).toEqual({
      id: result.id,
      title: input.title,
      description: null,
      maxPeople: input.maxPeople,
      deadline: new Date(input.deadline),
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      fee: input.fee,
      createdAt: result.createdAt
    });
  });
});

describe('getMClassList unit test - M클래스 목록 조회 관련 서비스 유닛 테스트', () => {
  let em: any;
  let mclassRepo: any;

  beforeEach(() => {
    mclassRepo = { find: jest.fn() };
    em = { getRepository: jest.fn(() => mclassRepo) };
  });

  it('mclass 목록 조회 성공', async () => {
    const input = {
      limit: 10,
      last: 1
    };

    await getMClassList(em, input);
    
    expect(mclassRepo.find).toHaveBeenCalledWith(
      { id: { $lt: input.last }, isDelete: false },
      { orderBy: { id: QueryOrder.DESC }, limit: input.limit }
    );
  });

  it('last가 없는 경우 where 없이 mclass 목록 조회 성공', async () => {
    const input = {
      limit: 10,
      last: undefined
    };

    await getMClassList(em, input);

    expect(mclassRepo.find).toHaveBeenCalledWith({ isDelete: false },{ orderBy: { id: QueryOrder.DESC }, limit: input.limit });
  })
});

describe('getMClassById unit test - M클래스 상세 조회 관련 서비스 유닛 테스트', () => {
  let em: any;
  let mclassRepo: any;

  beforeEach(() => {
    mclassRepo = { findOne: jest.fn() };
    em = { getRepository: jest.fn(() => mclassRepo) };
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
      fee: 100,
      createdAt: new Date()
    };
    mclassRepo.findOne.mockResolvedValue(mclassData);

    const result = await getMClassById(em, mclassData.id);

    expect(mclassRepo.findOne).toHaveBeenCalledWith({ id: mclassData.id, isDelete: false });
    expect(result).toEqual({
      id: mclassData.id,
      title: mclassData.title,
      description: mclassData.description,
      maxPeople: mclassData.maxPeople,
      deadline: mclassData.deadline,
      startAt: mclassData.startAt,
      endAt: mclassData.endAt,
      fee: mclassData.fee,
      createdAt: mclassData.createdAt
    });
  });

  it('존재하지 않는 id인 경우 실패', async () => {
    (mclassRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(getMClassById(em, 1)).rejects.toThrow(new NotFoundError());
  });
});

describe('deleteMClassById unit test - M클래스 삭제 관련 서비스 유닛 테스트', () => {
  let em: any;
  let mclassRepo: any;
  let appRepo: any;

  beforeEach(() => {
    mclassRepo = { findOne: jest.fn() };
    appRepo = { count: jest.fn() }
    em = {
      getRepository: jest.fn((entity) => entity === MClass ? mclassRepo : appRepo),
      flush: jest.fn()
    };
  });

  it('mclass 삭제 성공', async () => {
    const mclassData = { id: 1 };
    mclassRepo.findOne.mockResolvedValue(mclassData);
    appRepo.count.mockResolvedValue(0);

    const result = await deleteMClassById(em, mclassData.id);

    expect(result).toBe(mclassData.id);
  });

  it('존재하지 않거나 이미 삭제된 id인 경우 실패', async () => {
    mclassRepo.findOne.mockResolvedValue(null);

    await expect(deleteMClassById(em, 1)).rejects.toThrow(new NotFoundError());
  });

  it('이미 신청한 사람이 있는 경우 실패', async () => {
    const mclassData = { id: 1 };
    mclassRepo.findOne.mockResolvedValue(mclassData);
    appRepo.count.mockResolvedValue(1);

    await expect(deleteMClassById(em, mclassData.id)).rejects.toThrow(new ConflictError(ErrorMessages.MCLASS_HAS_APPLICATION));
  })
});

describe('applyToMClass unit test - M클래스 신청 관련 서비스 유닛 테스트', () => {
  let em: any;
  let appRepo: any;

  const requestUser = {
    id: 1,
    username: 'test',
    isAdmin: true
  };

  beforeEach(() => {
    appRepo = {
      create: jest.fn(),
      count: jest.fn(),
      findOne: jest.fn()
    };
    em = {
      getRepository: jest.fn(() => appRepo),
      getReference: jest.fn(),
      findOne: jest.fn(),
      begin: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn()
    };
  });

  it('application 저장 성공', async () => {
    em.findOne.mockResolvedValue({
      id: 1,
      maxPeople: 10,
      createdUser: { id: 2 }
    });
    appRepo.count.mockResolvedValue(0);
    appRepo.findOne.mockResolvedValue(null);

    await applyToMClass(em, 1, requestUser);

    expect(em.begin).toHaveBeenCalled();
    expect(em.commit).toHaveBeenCalled();
  });

  it('존재하지 않는 mclass인 경우 실패', async () => {
    em.findOne.mockResolvedValue(null);

    await expect(applyToMClass(em, 1, requestUser)).rejects.toThrow(new NotFoundError());
    expect(em.begin).toHaveBeenCalled();
    expect(em.commit).not.toHaveBeenCalled();
    expect(em.rollback).toHaveBeenCalled();
  });

  it('본인이 만든 mclass인 경우 실패', async () => {
    em.findOne.mockResolvedValue({ createdUser: requestUser })

    await expect(applyToMClass(em, 1, requestUser)).rejects.toThrow(new ForbiddenError(ErrorMessages.CAN_NOT_APPLY_TO_OWN_MCLASS));
    expect(em.begin).toHaveBeenCalled();
    expect(em.commit).not.toHaveBeenCalled();
    expect(em.rollback).toHaveBeenCalled();
  });

  it('deadline이 현재 시간 이하인 경우 실패', async () => {
    em.findOne.mockResolvedValue({
      id: 1,
      maxPeople: 10,
      deadline: new Date(Date.now() - 1000),
      createdUser: { id: 2 }
    });
    appRepo.count.mockResolvedValue(0);
    appRepo.findOne.mockResolvedValue(null);

    await expect(applyToMClass(em, 1, requestUser)).rejects.toThrow(new ConflictError(ErrorMessages.DEADLINE_OVER));
    expect(em.begin).toHaveBeenCalled();
    expect(em.commit).not.toHaveBeenCalled();
    expect(em.rollback).toHaveBeenCalled();
  });

  it('application 수가 maxPeople 이상인 경우 실패', async () => {
    em.findOne.mockResolvedValue({
      id: 1,
      maxPeople: 10,
      createdUser: { id: 2 }
    });
    appRepo.count.mockResolvedValue(100);
    appRepo.findOne.mockResolvedValue(null);

    await expect(applyToMClass(em, 1, requestUser)).rejects.toThrow(new ConflictError(ErrorMessages.MAX_PEOPLE_EXCESS));
    expect(em.begin).toHaveBeenCalled();
    expect(em.commit).not.toHaveBeenCalled();
    expect(em.rollback).toHaveBeenCalled();
  });

  it('해당 mclass와 user에 해당하는 application이 이미 존재한 경우 실패', async () => {
    em.findOne.mockResolvedValue({
      id: 1,
      maxPeople: 10,
      createdUser: { id: 2 }
    });
    appRepo.count.mockResolvedValue(0);
    appRepo.findOne.mockResolvedValue({ id: 1 });

    await expect(applyToMClass(em, 1, requestUser)).rejects.toThrow(new ConflictError(ErrorMessages.ALREADY_APPLY));
    expect(em.begin).toHaveBeenCalled();
    expect(em.commit).not.toHaveBeenCalled();
    expect(em.rollback).toHaveBeenCalled();
  });
});
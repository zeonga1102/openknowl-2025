import request from "supertest";

import { DI, start } from '../../index';
import app from '../../app';
import { DefaultLimits, ErrorMessages } from "../../constants";
import { getBearerToken } from "../utils";

const API = '/api/users/applications';

describe('내 신청 내역 조회 API GET /api/users/applications 통합 테스트', () => {
  let adminToken: string;

  const applicationCount = 15;
  const mclassData = {
    title: 'test class',
    description: 'class description',
    maxPeople: 10,
    deadline: new Date(Date.now() + 1000 * 60).toISOString(),
    startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    fee: 100
  };
  
  beforeAll(async () => {
    await start;
    await DI.orm.getSchemaGenerator().refreshDatabase();

    // 1. 관리자 토큰 획득
    DI.em = DI.orm.em.fork();
    adminToken = await getBearerToken(DI.em);

    // 2. M클래스 applicationCount 개 생성
    for (let i = 0; i < applicationCount; i++) {
      const mclass = await request(app).post('/api/mclasses').set('Authorization', adminToken).send(mclassData);
  
      // 3. 생성한 M클래스 신청
      await request(app).post(`/api/mclasses/${mclass.body.id}/apply`).set('Authorization', adminToken);
    }
  });

  afterAll(async () => {
    await DI.orm.close(true);
    DI.server.close();
  });

  beforeEach(async () => {
    DI.em = DI.orm.em.fork();
  });

  it('내 신청 내역 조회 성공', async () => {
    const input = {
      limit: 5,
      last: 10
    };
    const result = await request(app).get(API).query(input).set('Authorization', adminToken)

    expect(result.status).toBe(200);
    expect(result.body.list).toBeInstanceOf(Array);
    expect(result.body.list.length).toBe(input.limit);
    expect(result.body.list[0]).toEqual({
      id: input.last - 1,
      mclassId: expect.any(Number),
      title: mclassData.title,
      startAt: mclassData.startAt,
      endAt: mclassData.endAt,
      fee: mclassData.fee,
      createdAt: expect.any(String)
    });
  });

  it(`limit가 없는 경우 내 신청 내역 ${DefaultLimits.MCLASS} 개 조회 성공`, async () => {
    const input = {
      limit: undefined,
      last: 15
    };
    
    const result = await request(app).get(API).query(input).set('Authorization', adminToken);

    expect(result.status).toBe(200);
    expect(result.body.list).toBeInstanceOf(Array);
    expect(result.body.list.length).toBe(DefaultLimits.MCLASS);
    expect(result.body.list[0]).toEqual({
      id: input.last - 1,
      mclassId: expect.any(Number),
      title: mclassData.title,
      startAt: mclassData.startAt,
      endAt: mclassData.endAt,
      fee: mclassData.fee,
      createdAt: expect.any(String)
    });
  });

  it('last가 없는 경우 내 신청 내역 처음부터 조회 성공', async () => {
    const input = {
      limit: 5,
      last: undefined
    };
    const result = await request(app).get(API).query(input).set('Authorization', adminToken)

    expect(result.status).toBe(200);
    expect(result.body.list).toBeInstanceOf(Array);
    expect(result.body.list.length).toBe(input.limit);
    expect(result.body.list[0]).toEqual({
      id: applicationCount,
      mclassId: expect.any(Number),
      title: mclassData.title,
      startAt: mclassData.startAt,
      endAt: mclassData.endAt,
      fee: mclassData.fee,
      createdAt: expect.any(String)
    });
  });

  it('JWT가 없는 경우 실패', async () => {
    const input = {
      limit: 5,
      last: 10
    };
    const result = await request(app).get(API).query(input);

    expect(result.status).toBe(401);
    expect(result.body.message).toBe(ErrorMessages.UNAUTHORIZED);
  })
});
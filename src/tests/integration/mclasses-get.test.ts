import request from 'supertest';

import { DI, start } from '../../index';
import app from '../../app';
import { DefaultLimits, ErrorMessages } from '../../constants';

const API = '/api/mclasses';

describe('M클래스 목록 조회 API GET /api/mclasses 통합 테스트', () => {
  let adminToken: string;

  const mclassListLength = 15;
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

    // 1. 회원가입 및 로그인하여 토큰 획득
    const adminUserData = {
      username: 'admin',
      password: 'password',
      name: 'admin',
      email: 'admin@example.com',
      isAdmin: true
    };
    await request(app).post('/api/users/signup').send(adminUserData);
    const LoginResult = await request(app).post('/api/users/login').send(adminUserData);

    adminToken = LoginResult.body.accessToken;

    // 2. M클래스 mclassListLength 개 생성
    const mclassListData = new Array(mclassListLength).fill(0).map(() => ({ ...mclassData }));
    for (const data of mclassListData) {
      await request(app).post(API).set('Authorization', `Bearer ${adminToken}`).send(data);
    }

    // 3. id가 2인 M클래스 삭제
    await request(app).delete(API + '/2').set('Authorization', `Bearer ${adminToken}`);
  });

  afterAll(async () => {
    await DI.orm.close(true);
    DI.server.close();
  });

  beforeEach(async () => {
    DI.em = DI.orm.em.fork();
  });

  it('M클래스 목록 조회 성공', async () => {
    const limit = 5;
    const last = 10;
    
    const result = await request(app).get(API).query({ limit: limit, last: last });

    expect(result.status).toBe(200);
    expect(result.body.list).toBeInstanceOf(Array);
    expect(result.body.list.length).toBe(limit);
    expect(result.body.list[0]).toEqual({
      id: last - 1,
      title: mclassData.title,
      maxPeople: mclassData.maxPeople,
      deadline: mclassData.deadline,
      startAt: mclassData.startAt,
      endAt: mclassData.endAt
    });
  });

  it(`limit가 없는 경우 M클래스 목록 ${DefaultLimits.MCLASS} 개 조회 성공`, async () => {
    const limit = undefined;
    const last = 15;
    
    const result = await request(app).get(API).query({ limit: limit, last: last });

    expect(result.status).toBe(200);
    expect(result.body.list).toBeInstanceOf(Array);
    expect(result.body.list.length).toBe(DefaultLimits.MCLASS);
    expect(result.body.list[0]).toEqual({
      id: last - 1,
      title: mclassData.title,
      maxPeople: mclassData.maxPeople,
      deadline: mclassData.deadline,
      startAt: mclassData.startAt,
      endAt: mclassData.endAt
    });
  });

  it('last가 없는 경우 M클래스 목록 조회 성공', async () => {
    const limit = 5;
    const last = undefined;
    
    const result = await request(app).get(API).query({ limit: limit, last: last });

    expect(result.status).toBe(200);
    expect(result.body.list).toBeInstanceOf(Array);
    expect(result.body.list.length).toBe(limit);
    expect(result.body.list[0]).toEqual({
      id: mclassListLength,
      title: mclassData.title,
      maxPeople: mclassData.maxPeople,
      deadline: mclassData.deadline,
      startAt: mclassData.startAt,
      endAt: mclassData.endAt
    });
  });

  it('삭제된 M클래스는 제외하고 목록 조회 성공', async () => {
    const limit = 5;
    const last = 7;
    
    const result = await request(app).get(API).query({ limit: limit, last: last });

    expect(result.status).toBe(200);
    expect(result.body.list).toBeInstanceOf(Array);
    expect(result.body.list.length).toBe(limit);
    expect(result.body.list[result.body.list.length - 1]).toEqual({
      id: 1,
      title: mclassData.title,
      maxPeople: mclassData.maxPeople,
      deadline: mclassData.deadline,
      startAt: mclassData.startAt,
      endAt: mclassData.endAt
    });
  })

  it('limit가 number가 아닐 경우 실패', async () => {
    const limit = 'wrong';
    const last = 10;
    
    const result = await request(app).get(API).query({ limit: limit, last: last });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe(ErrorMessages.VALIDATION_FAILED);
  });

  it('limit가 1 미만인 경우 실패', async () => {
    const limit = 0;
    const last = 10;
    
    const result = await request(app).get(API).query({ limit: limit, last: last });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe(ErrorMessages.VALIDATION_FAILED);
  });

  it('limit가 100 초과인 경우 실패', async () => {
    const limit = 101;
    const last = 10;
    
    const result = await request(app).get(API).query({ limit: limit, last: last });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe(ErrorMessages.VALIDATION_FAILED);
  });
});
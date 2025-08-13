import request from 'supertest';

import { DI, start } from '../../index';
import app from '../../app';
import { DefaultLimits, ErrorMessages } from '../../constants';

const API = '/api/mclasses';

describe('M클래스 목록 조회 API GET /api/mclasses 통합 테스트', () => {
  let adminToken: string;

  const mclassListLength = 15;
  const adminUserData = {
    username: 'admin',
    password: 'password',
    name: 'admin',
    email: 'admin@example.com',
    isAdmin: true
  };

  beforeAll(async () => {
    await start;
    await DI.orm.getSchemaGenerator().refreshDatabase();

    await request(app).post('/api/users/signup').send(adminUserData);
    const LoginResult = await request(app).post('/api/users/login').send(adminUserData);
    adminToken = LoginResult.body.accessToken;

    const mclassData = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };
    const mclassListData = new Array(mclassListLength).fill(0).map(() => ({ ...mclassData }));
    for (const data of mclassListData) {
      await request(app).post(API).set('Authorization', `Bearer ${adminToken}`).send(data)
    }
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
    expect(result.body.list[0].id).toBe(last - 1);
  });

  it(`limit가 없는 경우 M클래스 목록 ${DefaultLimits.MCLASS} 개 조회 성공`, async () => {
    const limit = undefined;
    const last = 15;
    
    const result = await request(app).get(API).query({ limit: limit, last: last });

    expect(result.status).toBe(200);
    expect(result.body.list).toBeInstanceOf(Array);
    expect(result.body.list.length).toBe(DefaultLimits.MCLASS);
    expect(result.body.list[0].id).toBe(last - 1);
  });

  it('last가 없는 경우 M클래스 목록 조회 성공', async () => {
    const limit = 5;
    const last = undefined;
    
    const result = await request(app).get(API).query({ limit: limit, last: last });

    expect(result.status).toBe(200);
    expect(result.body.list).toBeInstanceOf(Array);
    expect(result.body.list.length).toBe(limit);
    expect(result.body.list[0].id).toBe(mclassListLength);
  });

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
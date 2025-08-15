import request from 'supertest';

import { DI, start } from '../../index';
import app from '../../app';
import { ErrorMessages } from '../../constants';

const API = '/api/mclasses/';

describe('M클래스 상세 조회 API GET /api/mclasses/:id 통합 테스트', () => {
  let adminToken: string;
  let mclassId: number;

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

    adminToken = `Bearer ${LoginResult.body.accessToken}`;

    // 2. M클래스 생성
    const mclass = await request(app).post(API).set('Authorization', adminToken).send(mclassData);
    mclassId = mclass.body.id;
  });

  afterAll(async () => {
    await DI.orm.close(true);
    DI.server.close();
  });

  beforeEach(async () => {
    DI.em = DI.orm.em.fork();
  });

  it('M클래스 상세 조회 성공', async () => {
    const result = await request(app).get(API + mclassId);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      id: mclassId,
      title: mclassData.title,
      description: mclassData.description,
      maxPeople: mclassData.maxPeople,
      deadline: mclassData.deadline,
      startAt: mclassData.startAt,
      endAt: mclassData.endAt,
      fee: mclassData.fee
    });
  });

  it('삭제된 id로 조회할 경우 실패', async () => {
    // M클래스 삭제
    await request(app).delete(API + mclassId).set('Authorization', adminToken);

    const result = await request(app).get(API + mclassId);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe(ErrorMessages.NOT_FOUND);
  })

  it('존재하지 않는 id로 조회할 경우 실패', async () => {
    const result = await request(app).get(API + '100');

    expect(result.status).toBe(404);
    expect(result.body.message).toBe(ErrorMessages.NOT_FOUND);
  });

  it('id가 숫자가 아닐 경우 실패', async () => {
    const result = await request(app).get(API + 'wrong');

    expect(result.status).toBe(400);
    expect(result.body.message).toBe(ErrorMessages.VALIDATION_FAILED);
  });
});
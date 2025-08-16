import request from 'supertest';

import { DI, start } from '../../index';
import app from '../../app';
import { ErrorMessages } from '../../constants';
import { getBearerToken } from '../utils';

const API = '/api/mclasses';

describe('M클래스 생성 API POST /api/mclasses 통합 테스트', () => {
  let adminToken: string;

  beforeAll(async () => {
    await start;
    await DI.orm.getSchemaGenerator().refreshDatabase();

    // 관리자 토큰 획득
    DI.em = DI.orm.em.fork();
    adminToken = await getBearerToken(DI.em);
  });

  afterAll(async () => {
    await DI.orm.close(true);
    DI.server.close();
  });

  beforeEach(async () => {
    DI.em = DI.orm.em.fork();
  });

  it('M클래스 생성 성공', async () => {
    const input = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };

    const result = await request(app).post(API).set('Authorization', adminToken).send(input)

    expect(result.status).toBe(201);
    expect(result.body).toEqual({
      id: result.body.id,
      title: input.title,
      description: input.description,
      maxPeople: input.maxPeople,
      deadline: input.deadline,
      startAt: input.startAt,
      endAt: input.endAt,
      fee: input.fee,
      createdAt: result.body.createdAt
    });
  });

  it('description이 없는 경우 M클래스 생성 성공', async () => {
    const input = {
      title: 'test class',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };

    const result = await request(app).post(API).set('Authorization', adminToken).send(input)

    expect(result.status).toBe(201);
    expect(result.body).toEqual({
      id: result.body.id,
      title: input.title,
      description: null,
      maxPeople: input.maxPeople,
      deadline: input.deadline,
      startAt: input.startAt,
      endAt: input.endAt,
      fee: input.fee,
      createdAt: result.body.createdAt
    });
  });

  it('JWT 토큰이 없는 경우 실패', async () => {
    const input = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };

    const result = await request(app).post(API).send(input)

    expect(result.status).toBe(401);
    expect(result.body.message).toBe(ErrorMessages.UNAUTHORIZED);
  });

  it('관리자가 아닌 유저가 요청한 경우 실패', async () => {
    // isAdmin이 false인 사용자 회원가입 및 로그인하여 토큰 획득
    const commonUserData = {
        username: 'common',
        password: 'password',
        name: 'common',
        email: 'common@example.com',
        isAdmin: false
    };
    await request(app).post('/api/users/signup').send(commonUserData);
    const LoginResult = await request(app).post('/api/users/login').send(commonUserData);
    const commomToken = LoginResult.body.accessToken;

    const input = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };

    const result = await request(app).post(API).set('Authorization', `Bearer ${commomToken}`).send(input)

    expect(result.status).toBe(403);
    expect(result.body.message).toBe(ErrorMessages.FORBIDDEN);
  });

  it('maxPeople가 1 미만인 경우 실패', async () => {
    const input = {
      title: 'test class',
      description: 'class description',
      maxPeople: 0,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };

    const result = await request(app).post(API).set('Authorization', adminToken).send(input)

    expect(result.status).toBe(400);
    expect(result.body.message).toBe(ErrorMessages.VALIDATION_FAILED);
  });
});
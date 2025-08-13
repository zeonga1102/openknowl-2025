import request from 'supertest';

import { DI, start } from '../../index';
import app from '../../app';
import { User } from '../../entities';
import { ErrorMessages } from '../../constants';

const API = '/api/users/login';

describe('로그인 API POST /api/users/login 통합 테스트', () => {
  const existingData = {
    username: 'login',
    password: 'password',
    name: 'user',
    email: 'logintest@example.com'
  };

  beforeAll(async () => {
    await start;
    await DI.orm.getSchemaGenerator().refreshDatabase();
  });

  afterAll(async () => {
    await DI.orm.close(true);
    DI.server.close();
  });

  beforeEach(async () => {
    DI.em = DI.orm.em.fork();
    await DI.em.nativeDelete(User, {});

    await request(app).post('/api/users/signup').send(existingData);
  });

  it('로그인 성공', async () => {
    const result = await request(app).post(API).send(existingData);

    expect(result.status).toBe(201);
    expect(result.body).toHaveProperty('accessToken');
  });

  it('존재하지 않는 아이디로 로그인 시 실패', async () => {
    const input = {
      username: 'wrong',
      password: existingData.password
    };

    const result = await request(app).post(API).send(input);

    expect(result.status).toBe(401)
    expect(result.body.message).toBe(ErrorMessages.LOGIN_FAILED);
  });

  it('비밀번호 틀릴 경우 실패', async () => {
    const input = {
      username: existingData.username,
      password: 'wrong'
    };

    const result = await request(app).post(API).send(input);

    expect(result.status).toBe(401)
    expect(result.body.message).toBe(ErrorMessages.LOGIN_FAILED);
  });

  it('username이 8자를 초과한 경우 실패', async () => {
    const input = {
      username: '123456789',
      password: existingData.password
    };

    const result = await request(app).post(API).send(input);

    expect(result.status).toBe(400)
    expect(result.body.message).toBe(ErrorMessages.VALIDATION_FAILED);
  });
});
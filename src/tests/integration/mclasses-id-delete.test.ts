import request from 'supertest';

import { DI, start } from '../../index';
import app from '../../app';
import { ErrorMessages } from '../../constants';

const API = '/api/mclasses/';

describe('M클래스 삭제 API DELETE /api/mclasses/:id 통합 테스트', () => {
  let adminToken: string;
  let mclassId: number

  beforeAll(async () => {
    await start;
    await DI.orm.getSchemaGenerator().refreshDatabase();

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

    const mclassData = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };
    const createResult = await request(app).post(API).set('Authorization', `Bearer ${adminToken}`).send(mclassData);
    mclassId = createResult.body.id;
  });

  afterAll(async () => {
    await DI.orm.close(true);
    DI.server.close();
  });

  beforeEach(async () => {
    DI.em = DI.orm.em.fork();
  });

  it('M클래스 삭제 성공', async () => {
    const result = await request(app).delete(API + mclassId).set('Authorization', `Bearer ${adminToken}`);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ id: mclassId });
  })

  it('JWT가 없는 경우 실패', async () => {
    const result = await request(app).delete(API + mclassId);

    expect(result.status).toBe(401);
    expect(result.body.message).toBe(ErrorMessages.UNAUTHORIZED);
  });

  it('관리자가 아닌 유저가 요청한 경우 실패', async () => {
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

    const result = await request(app).delete(API + mclassId).set('Authorization', `Bearer ${commomToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe(ErrorMessages.FORBIDDEN);
  })

  it('존재하지 않는 id인 경우 실패', async () => {
    const result = await request(app).delete(API + '100').set('Authorization', `Bearer ${adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe(ErrorMessages.NOT_FOUND);
  });

  it('이미 삭제한 id인 경우 실패', async () => {
    const result = await request(app).delete(API + mclassId).set('Authorization', `Bearer ${adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe(ErrorMessages.NOT_FOUND);
  });
});
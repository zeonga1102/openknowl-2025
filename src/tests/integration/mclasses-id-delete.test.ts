import request from 'supertest';

import { DI, start } from '../../index';
import app from '../../app';
import { ErrorMessages } from '../../constants';

const API = '/api/mclasses/';

describe('M클래스 삭제 API DELETE /api/mclasses/:id 통합 테스트', () => {
  let adminToken: string;

  beforeAll(async () => {
    await start;
    await DI.orm.getSchemaGenerator().refreshDatabase();

    // 회원가입 및 로그인하여 토큰 획득
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
  });

  afterAll(async () => {
    await DI.orm.close(true);
    DI.server.close();
  });

  beforeEach(async () => {
    DI.em = DI.orm.em.fork();
  });

  it('M클래스 삭제 성공', async () => {
    // M클래스 생성
    const mclassData = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };
    const createResult = await request(app).post(API).set('Authorization', adminToken).send(mclassData);
    const mclassId = createResult.body.id;

    const result = await request(app).delete(API + mclassId).set('Authorization', adminToken);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ id: mclassId });
  })

  it('JWT가 없는 경우 실패', async () => {
    const result = await request(app).delete(API + 1);

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

    const result = await request(app).delete(API + 1).set('Authorization', `Bearer ${commomToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe(ErrorMessages.FORBIDDEN);
  })

  it('존재하지 않는 id인 경우 실패', async () => {
    const result = await request(app).delete(API + '100').set('Authorization', adminToken);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe(ErrorMessages.NOT_FOUND);
  });

  it('이미 삭제한 id인 경우 실패', async () => {
    // M클래스 생성
    const mclassData = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };
    const createResult = await request(app).post(API).set('Authorization', adminToken).send(mclassData);
    const mclassId = createResult.body.id;

    // 동일한 M클래스 두번 삭제 요청
    const successResult = await request(app).delete(API + mclassId).set('Authorization', adminToken);
    expect(successResult.status).toBe(200);

    const failureResult = await request(app).delete(API + mclassId).set('Authorization', adminToken);

    expect(failureResult.status).toBe(404);
    expect(failureResult.body.message).toBe(ErrorMessages.NOT_FOUND);
  });

  it('신청자가 있는 경우 실패', async () => {
    // M클래스 생성
    const mclassData = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };
    const createResult = await request(app).post(API).set('Authorization', adminToken).send(mclassData);
    const mclassId = createResult.body.id;

    // M클래스 신청
    await request(app).post(`${API}${mclassId}/apply`).set('Authorization', adminToken);

    const result = await request(app).delete(API + mclassId).set('Authorization', adminToken);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe(ErrorMessages.MCLASS_HAS_APPLICATION);
  });
});
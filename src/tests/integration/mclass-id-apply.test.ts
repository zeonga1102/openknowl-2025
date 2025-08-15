import request from 'supertest';

import { DI, start } from '../../index';
import app from '../../app';
import { ErrorMessages } from '../../constants';

describe('M클래스 생성 API POST /api/mclasses 통합 테스트', () => {
  let adminToken: string;

  const getApi = (id: number) => `/api/mclasses/${id}/apply`;

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

  it('M클래스 신청 성공', async () => {
    const mclassData = {
      title: 'test class',
      description: 'class description',
      maxPeople: 1,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };
    const mclass = await request(app).post('/api/mclasses').set('Authorization', adminToken).send(mclassData);

    const result = await request(app).post(getApi(mclass.body.id)).set('Authorization', adminToken);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ id: 1 });
  });

  it('JWT가 없는 경우 실패', async () => {
    const result = await request(app).post(getApi(1));

    expect(result.status).toBe(401);
    expect(result.body.message).toBe(ErrorMessages.UNAUTHORIZED);
  });

  it('존재하지 않는 M클래스 신청한 경우 실패', async () => {
    const result = await request(app).post(getApi(100)).set('Authorization', adminToken);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe(ErrorMessages.NOT_FOUND);
  });

  it('마감 시간이 지났을 경우 실패', async () => {
    const mclassData = {
      title: 'test class',
      description: 'class description',
      maxPeople: 1,
      deadline: new Date(Date.now() + 1000).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };
    const mclass = await request(app).post('/api/mclasses').set('Authorization', adminToken).send(mclassData);

    // 마감 시간 초과
    console.log('====== 2초 대기 ======');
    await new Promise(r => setTimeout(r, 2000));

    const result = await request(app).post(getApi(mclass.body.id)).set('Authorization', adminToken);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe(ErrorMessages.DEADLINE_OVER);
  });

  it('정원 초과한 경우 실패', async () => {
    const mclassData = {
      title: 'test class',
      description: 'class description',
      maxPeople: 1,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };
    const mclass = await request(app).post('/api/mclasses').set('Authorization', adminToken).send(mclassData);

    // 5명 동시 신청
    const requestList = [];
    for (let i = 0; i < 5; i++) {
      const userData = {
        username: `user${i}`,
        password: 'password',
        name: 'user',
        email: `user${i}@example.com`,
        isAdmin: true
      };
      await request(app).post('/api/users/signup').send(userData);
      const LoginResult = await request(app).post('/api/users/login').send(userData);
      const token = LoginResult.body.accessToken;

      requestList.push(request(app).post(getApi(mclass.body.id)).set('Authorization', `Bearer ${token}`));
    }

    const resultList = await Promise.allSettled(requestList);

    const successCount = resultList.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
    expect(successCount).toBe(mclassData.maxPeople);

    const failureList = resultList.filter(r => r.status === 'fulfilled' && r.value.status === 400);
    expect(failureList.length).toBe(requestList.length - mclassData.maxPeople);
    failureList.map((r: any) => expect(r.value.body.message).toBe(ErrorMessages.MAX_PEOPLE_EXCESS));
  });

  it('이미 신청한 경우 실패', async () => {
    const mclassData = {
      title: 'test class',
      description: 'class description',
      maxPeople: 10,
      deadline: new Date(Date.now() + 1000 * 60).toISOString(),
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fee: 100
    };
    const mclass = await request(app).post('/api/mclasses').set('Authorization', adminToken).send(mclassData);

    // 같은 M클래스 같은 사용자로 2번 신청
    await request(app).post(getApi(mclass.body.id)).set('Authorization', adminToken);
    const result = await request(app).post(getApi(mclass.body.id)).set('Authorization', adminToken);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe(ErrorMessages.ALREADY_APPLY);
  });
});
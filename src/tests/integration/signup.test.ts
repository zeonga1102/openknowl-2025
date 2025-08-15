import request from 'supertest';
import bcrypt from 'bcrypt'

import { DI, start } from '../../index';
import app from '../../app';
import { User } from '../../entities';
import { ErrorMessages } from '../../constants';

const API = '/api/users/signup';

describe('회원가입 API POST /api/usres/signup 통합 테스트', () => {
  beforeAll(async () => {
    await start;
    await DI.orm.getSchemaGenerator().refreshDatabase(); // DB 초기화
  });

  afterAll(async () => {
    await DI.orm.close(true);
    DI.server.close();
  });

  beforeEach(async () => {
    DI.em = DI.orm.em.fork()
    // 각 테스트 전에 테이블 비우기
    await DI.em.nativeDelete(User, {})
  });

  it('일반 유저 회원가입 성공', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '010-1234-5678',
      isAdmin: false
    };

    const result = await request(app).post(API).send(input);

    expect(result.status).toBe(201);
    expect(result.body).toMatchObject({
      username: input.username,
      name: input.name,
      email: input.email,
      phone: input.phone,
      isAdmin: input.isAdmin
    });

    // 비밀번호가 해시로 저장되었는지 확인
    const user = await DI.em.findOneOrFail(User, { username: input.username });
    const isEqual = await bcrypt.compare(input.password, user.password);
    expect(isEqual).toBe(true);
  });

  it('관리자 유저 회원가입 성공', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '010-1234-5678',
      isAdmin: true
    };

    const result = await request(app).post(API).send(input);

    expect(result.status).toBe(201);
    expect(result.body.isAdmin).toBe(true);
  })

  it('isAdmin이 주어지지 않은 경우 일반 유저로 가입 성공', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '010-1234-5678'
    };

    const result = await request(app).post(API).send(input);

    expect(result.status).toBe(201);
    expect(result.body.isAdmin).toBe(false);
  });

  it('phone이 주어지지 않은 경우 가입 성공', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com'
    };

    const result = await request(app).post(API).send(input);

    expect(result.status).toBe(201);
    expect(result.body.phone).toBe(undefined);
  });

  it('username이 8자를 초과한 경우 가입 실패', async () => {
    const input = {
      username: '123456789',
      password: 'password',
      name: 'user',
      email: 'test@example.com'
    };

    const result = await request(app).post(API).send(input);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe(ErrorMessages.VALIDATION_FAILED);
  })

  it('email 형식이 틀릴 경우 가입 실패', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example'
    };

    const result = await request(app).post(API).send(input);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe(ErrorMessages.VALIDATION_FAILED);
  })

  it('phone 형식이 틀릴 경우 가입 실패', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '0101234'
    };

    const result = await request(app).post(API).send(input);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe(ErrorMessages.VALIDATION_FAILED);
  })

  it('username이 중복인 경우 가입 실패', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '010-1234-5678'
    };

    // 동일한 username으로 두 번 가입
    const result1 = await request(app).post(API).send(input);
    expect(result1.status).toBe(201);

    const result2 = await request(app)
      .post(API)
      .send({ ...input, email: 'diff@example.com', phone: '010-9876-5432' });
    
    expect(result2.status).toBe(400);
    expect(result2.body.message).toBe(ErrorMessages.EXISTING_USERNAME);
  })

  it('email이 중복인 경우 가입 실패', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '010-1234-5678'
    };

    // 동일한 email로 두 번 가입
    const result1 = await request(app).post(API).send(input);
    expect(result1.status).toBe(201);

    const result2 = await request(app)
      .post(API)
      .send({ ...input, username: 'diff', phone: '010-9876-5432' });
    
    expect(result2.status).toBe(400);
    expect(result2.body.message).toBe(ErrorMessages.EXISTING_EMAIL);
  })

  it('phone이 중복인 경우 가입 실패', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '010-1234-5678'
    };

    // 동일한 phone으로 두 번 가입
    const result1 = await request(app).post(API).send(input);
    expect(result1.status).toBe(201);

    const result2 = await request(app)
      .post(API)
      .send({ ...input, username: 'diff', email: 'diff@example.com' });
    
    expect(result2.status).toBe(400);
    expect(result2.body.message).toBe(ErrorMessages.EXISTING_PHONE);
  })
});

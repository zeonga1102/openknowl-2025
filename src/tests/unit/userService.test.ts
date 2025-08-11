import { EntityManager } from '@mikro-orm/postgresql';
import bcrypt from 'bcrypt';

import { createUser } from '../../services/userService';

jest.mock('bcrypt');

describe('createUser unit test - 회원가입 관련 서비스 유닛 테스트', () => {
  let em: EntityManager;

  beforeEach(() => {
    em = {
      flush: jest.fn(),
    } as unknown as EntityManager;
  });

  it('일반 유저 회원가입 성공', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '010-1234-5678',
      isAdmin: false,
    };

    const hashedPassword = 'hashedpassword';
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

    const result = await createUser(em, input);

    expect(result).toMatchObject({
      username: input.username,
      password: hashedPassword,
      name: input.name,
      email: input.email,
      phone: input.phone,
      isAdmin: input.isAdmin,
    });
  });

  it('관리자 유저 회원가입 성공', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '010-1234-5678',
      isAdmin: true,
    };

    const result = await createUser(em, input);

    expect(result.isAdmin).toBe(true);
  });

  it('isAdmin이 주어지지 않은 경우 일반 유저로 가입 성공', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '010-1234-5678'
    };

    const result = await createUser(em, input);

    expect(result.isAdmin).toBe(false);
  });

  it('phone이 주어지지 않은 경우 가입 성공', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com'
    };

    const result = await createUser(em, input);

    expect(result.phone).toBe(undefined);
  });
});
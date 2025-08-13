import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { createUser, loginUser } from '../../services/userService';
import { User } from '../../entities';
import { ErrorMessages } from '../../constants';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('createUser unit test - 회원가입 관련 서비스 유닛 테스트', () => {
  let em: EntityManager;
  let userRepo: EntityRepository<User>;

  beforeEach(() => {
    userRepo = {
      create: jest.fn(),
      findOne: jest.fn()
    } as unknown as EntityRepository<User>;

    em = {
      getRepository: jest.fn(() => userRepo),
      flush: jest.fn()
    } as unknown as EntityManager;
  });

  it('user 저장 성공', async () => {
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

  it('isAdmin이 true인 유저 저장 성공', async () => {
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

  it('isAdmin이 없는 user 저장 성공', async () => {
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

  it('phone이 없는 user 저장 성공', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com'
    };

    const result = await createUser(em, input);

    expect(result.phone).toBe(undefined);
  });

  it('username 중복 시 에러 발생', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '010-1234-5678'
    };

    (userRepo.findOne as jest.Mock).mockResolvedValue({ username: input.username });

    await expect(createUser(em, input)).rejects.toThrow(ErrorMessages.EXISTING_USERNAME);
  });

  it('email 중복 시 에러 발생', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com'
    };

    (userRepo.findOne as jest.Mock).mockResolvedValue({ email: input.email });

    await expect(createUser(em, input)).rejects.toThrow(ErrorMessages.EXISTING_EMAIL);
  });

  it('phone 중복 시 에러 발생', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '010-1234-5678'
    };

    (userRepo.findOne as jest.Mock).mockResolvedValue({ phone: input.phone });

    await expect(createUser(em, input)).rejects.toThrow(ErrorMessages.EXISTING_PHONE);
  });
});

describe('loginUser unit test - 로그인 관련 서비스 유닛 테스트', () => {
  let em: EntityManager;
  let userRepo: EntityRepository<User>;

  beforeEach(() => {
    userRepo = {
      findOne: jest.fn()
    } as unknown as EntityRepository<User>;

    em = {
      getRepository: jest.fn(() => userRepo)
    } as unknown as EntityManager;
  });

  it('JWT 토큰 발급 성공', async () => {
    const mockUser = {
      id: 1,
      username: 'test',
      password: 'hashedPassword'
    };
    const input = {
      username: 'test',
      password: 'password'
    };
    const mockToken = 'access token';

    (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    const result = await loginUser(em, input);

    expect(result.accessToken).toBe(mockToken);
  });

  it('존재하지 않는 username 사용 시 에러', async () => {
    const input = {
      username: 'test',
      password: 'password'
    };

    (userRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(loginUser(em, input)).rejects.toThrow(ErrorMessages.LOGIN_FAILED);
  });

  it('password 틀릴 경우 에러', async () => {
    const mockUser = {
      id: 1,
      username: 'test',
      password: 'hashedPassword'
    };
    const input = {
      username: 'test',
      password: 'password'
    };

    (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(loginUser(em, input)).rejects.toThrow(ErrorMessages.LOGIN_FAILED);
  });
});
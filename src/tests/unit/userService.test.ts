import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { createUser, loginUser } from '../../services/userService';
import { ErrorMessages } from '../../constants';
import { ConflictError, UnauthorizedError } from '../../errors';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('createUser unit test - 회원가입 관련 서비스 유닛 테스트', () => {
  let em: any;
  let userRepo: any;

  beforeEach(() => {
    userRepo = {
      create: jest.fn(),
      findOne: jest.fn()
    };
    em = {
      getRepository: jest.fn(() => userRepo),
      flush: jest.fn()
    };
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

    expect(result).toEqual({
      id: result.id,
      username: input.username,
      name: input.name,
      email: input.email,
      phone: input.phone,
      isAdmin: input.isAdmin,
      createdAt: result.createdAt
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

    expect(result).toEqual({
      id: result.id,
      username: input.username,
      name: input.name,
      email: input.email,
      phone: input.phone,
      isAdmin: input.isAdmin,
      createdAt: result.createdAt
    });
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

    expect(result).toEqual({
      id: result.id,
      username: input.username,
      name: input.name,
      email: input.email,
      phone: input.phone,
      isAdmin: false,
      createdAt: result.createdAt
    });
  });

  it('phone이 없는 user 저장 성공', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com'
    };

    const result = await createUser(em, input);

    expect(result).toEqual({
      id: result.id,
      username: input.username,
      name: input.name,
      email: input.email,
      phone: null,
      isAdmin: false,
      createdAt: result.createdAt
    });
  });

  it('username 중복 시 에러 발생', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '010-1234-5678'
    };

    userRepo.findOne.mockResolvedValue({ username: input.username });

    await expect(createUser(em, input)).rejects.toThrow(new ConflictError(ErrorMessages.EXISTING_USERNAME));
  });

  it('email 중복 시 에러 발생', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com'
    };

    userRepo.findOne.mockResolvedValue({ email: input.email });

    await expect(createUser(em, input)).rejects.toThrow(new ConflictError(ErrorMessages.EXISTING_EMAIL));
  });

  it('phone 중복 시 에러 발생', async () => {
    const input = {
      username: 'test',
      password: 'password',
      name: 'user',
      email: 'test@example.com',
      phone: '010-1234-5678'
    };

    userRepo.findOne.mockResolvedValue({ phone: input.phone });

    await expect(createUser(em, input)).rejects.toThrow(new ConflictError(ErrorMessages.EXISTING_PHONE));
  });
});

describe('loginUser unit test - 로그인 관련 서비스 유닛 테스트', () => {
  let em: any;
  let userRepo: any;

  beforeEach(() => {
    userRepo = { findOne: jest.fn() }
    em = { getRepository: jest.fn(() => userRepo) }
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

    userRepo.findOne.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    const result = await loginUser(em, input);

    expect(result).toBe(mockToken);
  });

  it('존재하지 않는 username 사용 시 에러', async () => {
    const input = {
      username: 'test',
      password: 'password'
    };

    userRepo.findOne.mockResolvedValue(null);

    await expect(loginUser(em, input)).rejects.toThrow(new UnauthorizedError(ErrorMessages.LOGIN_FAILED));
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

    userRepo.findOne.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(loginUser(em, input)).rejects.toThrow(new UnauthorizedError(ErrorMessages.LOGIN_FAILED));
  });
});
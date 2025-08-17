import request from 'supertest';
import { EntityManager } from '@mikro-orm/postgresql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../app';
import { User } from '../entities';
import { ENV } from '../config';

export async function getBearerToken(em: EntityManager, isAdmin: boolean = true) {
  const rand = Math.random().toString().substring(0, 8);

  // 유저 저장
  const user = new User();
  user.username = rand;
  user.password = await bcrypt.hash('password', 10);;
  user.name = rand;
  user.email = `${rand}@example.com`;
  user.isAdmin = isAdmin;
  
  const userRepo = em.getRepository(User);
  userRepo.create(user);
  await em.flush();
  
  // 로그인 하여 토큰 획득
  const LoginResult = await request(app).post('/api/users/login').send({ username: user.username, password: 'password' });
  return `Bearer ${LoginResult.body.accessToken}`;
}

export async function getExpiredBearerToken(em: EntityManager, isAdmin: boolean = true) {
  const rand = Math.random().toString().substring(0, 8);

  const user = new User();
  user.username = rand;
  user.password = await bcrypt.hash('password', 10);;
  user.name = rand;
  user.email = `${rand}@example.com`;
  user.isAdmin = isAdmin;

  const userRepo = em.getRepository(User);
  userRepo.create(user);
  await em.flush();

  const accessToken = jwt.sign(
    {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    },
    ENV.JWT.SECRET_KEY,
    { expiresIn: 0}
  );

  return `Bearer ${accessToken}`;
}
import request from 'supertest';
import { EntityManager } from '@mikro-orm/postgresql';
import bcrypt from 'bcrypt';

import app from '../app';
import { User } from '../entities';

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
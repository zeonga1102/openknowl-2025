import request from 'supertest';
import { EntityManager } from '@mikro-orm/postgresql';
import bcrypt from 'bcrypt';

import app from '../app';
import { User } from '../entities';

export async function getBearerToken(em: EntityManager, isAdmin: boolean = true) {
  // 관리자 유저 저장
  const adminUser = new User();
  adminUser.username = 'admin';
  adminUser.password = await bcrypt.hash('password', 10);;
  adminUser.name = 'admin';
  adminUser.email = 'admin@example.com';
  adminUser.isAdmin = isAdmin;
  
  const userRepo = em.getRepository(User);
  userRepo.create(adminUser);
  await em.flush();
  
  // 로그인 하여 토큰 획득
  const LoginResult = await request(app).post('/api/users/login').send({ username: adminUser.username, password: 'password' });
  return `Bearer ${LoginResult.body.accessToken}`;
}
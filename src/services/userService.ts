import { EntityManager, EntityRepository } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '../entities';
import { CreateUserDto, LoginDto } from '../dtos';
import { ErrorMessages } from '../constants';
import { ENV } from '../config';

export async function createUser(em: EntityManager, data: CreateUserDto) {
  const repo = em.getRepository(User);

  await checkUserCreateData(repo, data.username, data.email, data.phone);

  const user = new User();
  user.username = data.username;
  user.password = await bcrypt.hash(data.password, 10);
  user.name = data.name;
  user.email = data.email;
  user.phone = data.phone;
  user.isAdmin = data.isAdmin ?? false;

  repo.create(user);
    
  await em.flush();

  return user;
}

export async function loginUser(em: EntityManager, data: LoginDto) {
  const repo = em.getRepository(User);
  
  const user = await repo.findOne({ username: data.username });
  if (!user) throw new Error(ErrorMessages.LOGIN_FAILED);

  const isEqual = await bcrypt.compare(data.password, user.password);
  if (!isEqual) throw new Error(ErrorMessages.LOGIN_FAILED);

  const accessToken = jwt.sign(
    {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    },
    ENV.JWT.SECRET_KEY
  );

  return { accessToken };
}

async function checkUserCreateData(repo: EntityRepository<User>, username: string, email: string, phone?: string) {
  const existingUser = await repo.findOne({
    $or: [
      { username: username },
      { email: email },
      ...(phone ? [{ phone: phone }] : [])
    ]}
  );

  if (existingUser) {
    if (existingUser.username === username) throw new Error(ErrorMessages.EXISTING_USERNAME);
    if (existingUser.email === email) throw new Error(ErrorMessages.EXISTING_EMAIL);
    if (phone && existingUser.phone === phone) throw new Error(ErrorMessages.EXISTING_PHONE);
  }
}
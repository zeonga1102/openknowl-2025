import { EntityManager, EntityRepository } from '@mikro-orm/core';
import bcrypt from 'bcrypt';

import { User } from '../entities/User';
import { CreateUserDto } from '../dtos/CreateUserDto';
import { ErrorMessages } from '../constants/error-messages';

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
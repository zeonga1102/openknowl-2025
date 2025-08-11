import { EntityManager } from '@mikro-orm/core';
import bcrypt from 'bcrypt';

import { User } from '../entities/User';

export async function createUser(em: EntityManager, data: any) {
  const user = new User();
  user.username = data.username;
  user.password = await bcrypt.hash(data.password, 10);
  user.name = data.name;
  user.email = data.email;
  user.phone = data.phone;
  user.isAdmin = data.isAdmin ?? false;

  const userRepo = em.getRepository(User);
  userRepo.create(user);
    
  await em.flush();

  return user;
}
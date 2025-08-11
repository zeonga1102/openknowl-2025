import { Entity, Property } from '@mikro-orm/postgresql';

import { BaseEntity } from './BaseEntity';

@Entity()
export class User extends BaseEntity{
  @Property({ unique: true, length: 8 })
  username!: string;

  @Property({ length: 255 })
  password!: string;

  @Property({ length: 8 })
  name!: string;

  @Property({ unique: true, length: 255 })
  email!: string;

  @Property({ unique: true, nullable: true, length: 20 })
  phone?: string;

  @Property()
  isAdmin: boolean = false;
}
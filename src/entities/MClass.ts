import { Entity, Property, ManyToOne } from '@mikro-orm/postgresql';

import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity()
export class MClass extends BaseEntity {
  @Property({ length: 50 })
  title!: string;

  @Property({ length: 1000, nullable: true })
  description?: string;

  @Property()
  maxPeople!: number;

  @Property()
  deadline!: Date;

  @Property()
  startAt!: Date;

  @Property()
  endAt!: Date;

  @Property()
  fee!: number;

  @ManyToOne(() => User, { deleteRule: 'restrict' })
  createdUser!: User;
}
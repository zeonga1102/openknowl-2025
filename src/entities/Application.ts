import { Entity, ManyToOne, Unique } from '@mikro-orm/postgresql';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { MClass } from './MClass';

@Entity()
@Unique({ properties: ['mclass', 'user'] })
export class Application extends BaseEntity {
  @ManyToOne(() => MClass, { deleteRule: 'restrict' })
  mclass!: MClass;

  @ManyToOne(() => User, { deleteRule: 'cascade' })
  user!: User;
}
import { Entity, PrimaryKey, Property } from '@mikro-orm/postgresql';

@Entity()
export abstract class BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
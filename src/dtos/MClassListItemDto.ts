import { Expose, Type } from 'class-transformer';

export class MClassListItemDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  maxPeople: number;

  @Expose()
  @Type(() => Date)
  deadline: Date;

  @Expose()
  @Type(() => Date)
  startAt: Date;

  @Expose()
  @Type(() => Date)
  endAt: Date;
}
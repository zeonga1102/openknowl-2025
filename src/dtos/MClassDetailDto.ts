import { Expose } from 'class-transformer';

export class MClassDetailDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description?: string;

  @Expose()
  maxPeople: number;

  @Expose()
  deadline: Date;

  @Expose()
  startAt: Date;

  @Expose()
  endAt: Date;

  @Expose()
  fee: number;

  @Expose()
  createdAt: Date;
}

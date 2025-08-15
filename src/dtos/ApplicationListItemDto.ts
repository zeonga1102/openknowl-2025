import { Expose, Transform } from 'class-transformer';

export class ApplicationListItemDto {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ obj }) => obj.mclass.id)
  mclassId: number;

  @Expose()
  @Transform(({ obj }) => obj.mclass.title)
  title: string;

  @Expose()
  @Transform(({ obj }) => obj.mclass.startAt)
  startAt: Date;

  @Expose()
  @Transform(({ obj }) => obj.mclass.endAt)
  endAt: Date;

  @Expose()
  @Transform(({ obj }) => obj.mclass.fee)
  fee: number;

  @Expose()
  createdAt: Date;
}
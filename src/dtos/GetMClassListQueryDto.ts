import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { ErrorMessages, DefaultLimits } from '../constants';

export class GetMClassListQueryDto {
  @IsOptional()
  @Min(1, { message: ErrorMessages.GTE_1 })
  @Max(100, { message: ErrorMessages.LTE_100 })
  @IsInt({ message: ErrorMessages.INT })
  @Type(() => Number)
  limit: number = DefaultLimits.MCLASS;

  @IsOptional()
  @IsInt({ message: ErrorMessages.INT })
  @Type(() => Number)
  last?: number = undefined;
}
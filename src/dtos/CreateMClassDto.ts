import { IsString, Length, IsOptional, IsInt, Min, IsDateString, IsNotEmpty, Validate } from 'class-validator';

import { ErrorMessages } from '../constants';
import { MClassDateValidator, DeadlineStartAtDateValidator, StartAtEndAtDateValidator } from '../validators';

export class CreateMClassDto {
  @IsString({ message: ErrorMessages.STRING })
  @Length(1, 50, { message: ErrorMessages.TITLE_LENGTH })
  @IsNotEmpty({ message: ErrorMessages.REQUIRED })
  title: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.STRING })
  @Length(0, 1000, { message: ErrorMessages.DESCRIPTION_LENGTH })
  description?: string;

  @IsInt({ message: ErrorMessages.INT })
  @Min(1, { message: ErrorMessages.MAX_PEOPLE_MINIMUM })
  maxPeople: number;

  @Validate(DeadlineStartAtDateValidator)
  @Validate(MClassDateValidator)
  @IsDateString({}, { message: ErrorMessages.INVALID_DATE })
  deadline: string;

  @Validate(StartAtEndAtDateValidator)
  @Validate(DeadlineStartAtDateValidator)
  @Validate(MClassDateValidator)
  @IsDateString({}, { message: ErrorMessages.INVALID_DATE })
  startAt: string;

  @Validate(StartAtEndAtDateValidator)
  @Validate(MClassDateValidator)
  @IsDateString({}, { message: ErrorMessages.INVALID_DATE })
  endAt: string;

  @IsInt({ message: ErrorMessages.INT })
  @Min(0, { message: ErrorMessages.FEE_MINIMUM })
  fee: number;
}
import { IsEmail, IsOptional, IsString, IsBoolean, Length, Matches, IsNotEmpty } from 'class-validator';

import { ErrorMessages } from '../constants';

export class CreateUserDto {
  @Length(1, 8, { message: ErrorMessages.USERNAME_LENGTH })
  @IsString({ message: ErrorMessages.STRING })
  @IsNotEmpty({ message: ErrorMessages.REQUIRED })
  username: string;

  @Length(1, 8, { message: ErrorMessages.NAME_LENGTH })
  @IsString({ message: ErrorMessages.STRING })
  @IsNotEmpty({ message: ErrorMessages.REQUIRED })
  name: string;

  @Length(1, 15, { message: ErrorMessages.PASSWORD_LENGTH })
  @IsString({ message: ErrorMessages.STRING })
  @IsNotEmpty({ message: ErrorMessages.REQUIRED })
  password: string;

  @IsEmail({}, { message: ErrorMessages.INVALID_EMAIL })
  @IsNotEmpty({ message: ErrorMessages.REQUIRED })
  email: string;

  @IsOptional()
  @Matches(/^010-\d{4}-\d{4}$/, { message: ErrorMessages.INVALID_PHONE })
  phone?: string;

  @IsOptional()
  @IsBoolean({ message: ErrorMessages.BOOLEAN })
  isAdmin?: boolean;
}
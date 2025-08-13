import { IsString, Length, IsNotEmpty } from 'class-validator';

import { ErrorMessages } from '../constants';

export class LoginDto {
  @Length(1, 8, { message: ErrorMessages.USERNAME_LENGTH })
  @IsString({ message: ErrorMessages.STRING })
  @IsNotEmpty({ message: ErrorMessages.REQUIRED })
  username: string;

  @Length(1, 15, { message: ErrorMessages.PASSWORD_LENGTH })
  @IsString({ message: ErrorMessages.STRING })
  @IsNotEmpty({ message: ErrorMessages.REQUIRED })
  password: string;
}
import { IsInt } from "class-validator";
import { Type } from "class-transformer";

import { ErrorMessages } from "../constants";

export class IdParamDto {
  @IsInt({ message: ErrorMessages.INT })
  @Type(() => Number)
  id: number;
}
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

import { ErrorMessages } from "../constants";

@ValidatorConstraint({ name: 'isInvalidStartAtEndAt', async: false })
export class StartAtEndAtDateValidator implements ValidatorConstraintInterface {
  validate(_: any, validationArguments: ValidationArguments): Promise<boolean> | boolean {
    const dto = validationArguments.object as any;
    
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    if (endAt <= startAt) return false;

    return true;
  }
  defaultMessage(_: ValidationArguments): string {
    return ErrorMessages.INVALID_START_AT_END_AT;
  }
}
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

import { ErrorMessages } from "../constants";

@ValidatorConstraint({ name: 'isInvalidDeadlineStartAt', async: false })
export class DeadlineStartAtDateValidator implements ValidatorConstraintInterface {
  validate(_: any, validationArguments: ValidationArguments): Promise<boolean> | boolean {
    const dto = validationArguments.object as any;
    
    const deadline = new Date(dto.deadline);
    const startAt = new Date(dto.startAt);

    if (startAt <= deadline) return false;

    return true;
  }
  defaultMessage(_: ValidationArguments): string {
    return ErrorMessages.INVALID_DEADLINE_START_AT;
  }
}
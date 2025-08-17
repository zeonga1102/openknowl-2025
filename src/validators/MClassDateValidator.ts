import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

import { ErrorMessages } from "../constants";

@ValidatorConstraint({ name: 'isInvalidDate', async: false })
export class MClassDateValidator implements ValidatorConstraintInterface {
  validate(value: any, _: ValidationArguments): Promise<boolean> | boolean {
    const now = new Date();
    const dateValue = new Date(value);

    if (dateValue <= now) return false;

    return true;
  }
  defaultMessage(_: ValidationArguments): string {
    return ErrorMessages.GT_NOW;
  }
}
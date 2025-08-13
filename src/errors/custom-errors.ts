import { ErrorMessages } from "../constants";

export class BaseError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends BaseError {
  constructor(message = ErrorMessages.VALIDATION_FAILED) {
    super(400, message);
  }
}

export class ConflictError extends BaseError {
  constructor(message = ErrorMessages.EXSITING_DATA) {
    super(400, message);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = ErrorMessages.UNAUTHORIZED) {
    super(401, message);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = ErrorMessages.FORBIDDEN) {
    super(403, message);
  }
}
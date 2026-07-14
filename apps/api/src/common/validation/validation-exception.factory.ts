import { HttpStatus } from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { ApiErrorCode, type ApiFieldError } from '@finance/shared';
import { AppException } from '../exceptions/app.exception';

/**
 * Flattens (possibly nested) class-validator errors into a flat list of
 * field-level issues with dotted paths, e.g. `amount.amountMinor`.
 */
function flatten(errors: readonly ValidationError[], parentPath = ''): ApiFieldError[] {
  const result: ApiFieldError[] = [];

  for (const error of errors) {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;

    if (error.constraints) {
      for (const issue of Object.values(error.constraints)) {
        result.push({ field: path, issue });
      }
    }

    if (error.children?.length) {
      result.push(...flatten(error.children, path));
    }
  }

  return result;
}

/**
 * `exceptionFactory` for the global `ValidationPipe`. Produces a structured
 * {@link AppException} (VALIDATION_ERROR / 400) so DTO validation failures come
 * back in the same envelope as every other error, with actionable field details.
 */
export function validationExceptionFactory(errors: ValidationError[]): AppException {
  const details = flatten(errors);
  return new AppException(
    ApiErrorCode.VALIDATION_ERROR,
    'Request validation failed',
    HttpStatus.BAD_REQUEST,
    details,
  );
}

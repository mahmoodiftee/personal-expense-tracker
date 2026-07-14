import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiErrorCode, type ApiFieldError } from '@finance/shared';

/**
 * Base application exception. Carries a stable {@link ApiErrorCode} alongside
 * the HTTP status so the exception filter can render a consistent error
 * envelope. Domain/application code throws these instead of leaking raw
 * framework or driver errors (Separation of Concerns).
 */
export class AppException extends HttpException {
  readonly code: ApiErrorCode;
  readonly details?: readonly ApiFieldError[];

  constructor(
    code: ApiErrorCode,
    message: string,
    status: HttpStatus,
    details?: readonly ApiFieldError[],
  ) {
    super(message, status);
    this.code = code;
    this.details = details;
  }
}

/** 404 — a tenant-scoped resource was not found. */
export class ResourceNotFoundException extends AppException {
  constructor(resource: string, id?: string) {
    const suffix = id ? ` (id: ${id})` : '';
    super(ApiErrorCode.NOT_FOUND, `${resource} not found${suffix}`, HttpStatus.NOT_FOUND);
  }
}

/** 409 — the request conflicts with existing state (e.g. duplicate). */
export class ResourceConflictException extends AppException {
  constructor(message: string) {
    super(ApiErrorCode.CONFLICT, message, HttpStatus.CONFLICT);
  }
}

/** 422 — a domain/business validation rule was violated. */
export class DomainValidationException extends AppException {
  constructor(message: string, details?: readonly ApiFieldError[]) {
    super(ApiErrorCode.VALIDATION_ERROR, message, HttpStatus.UNPROCESSABLE_ENTITY, details);
  }
}

/** 401 — authentication required or invalid. */
export class UnauthenticatedException extends AppException {
  constructor(message = 'Authentication required') {
    super(ApiErrorCode.UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
  }
}

/** 403 — authenticated but not permitted. */
export class ForbiddenActionException extends AppException {
  constructor(message = 'You do not have permission to perform this action') {
    super(ApiErrorCode.FORBIDDEN, message, HttpStatus.FORBIDDEN);
  }
}

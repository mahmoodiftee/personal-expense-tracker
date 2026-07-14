import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiErrorCode, type ApiErrorResponse, type ApiFieldError } from '@finance/shared';
import { AppLogger } from '../../core/logger/app-logger.service';
import { AppException } from '../exceptions/app.exception';
import type { RequestContext } from '../http/request-context';

/**
 * Catches every unhandled exception and renders the shared {@link ApiErrorResponse}
 * envelope. This is the single place error shape is decided — controllers and
 * services never format errors themselves. 5xx are logged with stack traces;
 * 4xx are logged as warnings. Internal errors never leak details to clients.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestContext>();
    const requestId = request.id ?? 'unknown';

    const { status, code, message, details } = this.resolve(exception);

    const body: ApiErrorResponse = {
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
      meta: { requestId, timestamp: new Date().toISOString() },
    };

    this.logError(exception, status, request, requestId, message);
    response.status(status).json(body);
  }

  private resolve(exception: unknown): {
    status: number;
    code: ApiErrorCode | string;
    message: string;
    details?: readonly ApiFieldError[];
  } {
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : ((res as { message?: string | string[] }).message ?? exception.message);
      return {
        status,
        code: this.codeForStatus(status),
        message: Array.isArray(message) ? message.join('; ') : message,
      };
    }

    // Unknown / unexpected error — never leak internals to the client.
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ApiErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
    };
  }

  private codeForStatus(status: number): ApiErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ApiErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ApiErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ApiErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ApiErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ApiErrorCode.CONFLICT;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ApiErrorCode.VALIDATION_ERROR;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ApiErrorCode.RATE_LIMITED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ApiErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ApiErrorCode.INTERNAL_ERROR;
    }
  }

  private logError(
    exception: unknown,
    status: number,
    request: RequestContext,
    requestId: string,
    message: string,
  ): void {
    const line = `${request.method} ${request.originalUrl} -> ${status} [${requestId}] ${message}`;
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(line, stack);
    } else {
      this.logger.warn(line);
    }
  }
}

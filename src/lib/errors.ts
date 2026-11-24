import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from './logger';

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
  }
}

export class ValidationError extends AppError {
  fieldErrors?: Record<string, string[]>;

  constructor(message = 'Validation Error', fieldErrors?: Record<string, string[]>) {
    super(400, 'VALIDATION_ERROR', message);
    this.fieldErrors = fieldErrors;
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(409, 'CONFLICT', message);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate Limit Exceeded') {
    super(429, 'RATE_LIMIT_EXCEEDED', message);
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(500, 'INTERNAL_ERROR', message);
  }
}

export class PaymentError extends AppError {
  constructor(message = 'Payment Required') {
    super(402, 'PAYMENT_ERROR', message);
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    const payload: any = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };
    if (error instanceof ValidationError && error.fieldErrors) {
      payload.error.details = error.fieldErrors;
    }
    return NextResponse.json(payload, { status: error.statusCode });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  // Do not log in test/production unnecessarily or mask it safely
  if (process.env.NODE_ENV !== 'test') {
    logger.error('Unhandled API Error', { 
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error 
    });
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}

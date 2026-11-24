import { auth } from '@/lib/auth';
import { UnauthorizedError, ValidationError, handleApiError } from '@/lib/errors';
import { ZodSchema } from 'zod';
import { NextResponse } from 'next/server';

export async function getAuthenticatedUser(req: Request) {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError('Not authenticated');
  }
  return session.user as { id: string; role: string; email: string };
}

export async function getOptionalUser(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session.user as { id: string; role: string; email: string };
}

export function parseSearchParams(url: string): URLSearchParams {
  return new URL(url).searchParams;
}

export function withErrorHandler(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export async function validateBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    throw new ValidationError('Invalid JSON body');
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError('Validation failed', result.error.flatten().fieldErrors as Record<string, string[]>);
  }

  return result.data;
}

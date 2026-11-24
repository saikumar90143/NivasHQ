import { NextResponse } from 'next/server';

export function success<T>(data: T, meta?: object, status: number = 200): NextResponse {
  const payload: any = {
    success: true,
    data,
  };
  if (meta) {
    payload.meta = meta;
  }
  return NextResponse.json(payload, { status });
}

export function error(code: string, message: string, status: number, details?: object): NextResponse {
  const payload: any = {
    success: false,
    error: {
      code,
      message,
    },
  };
  if (details) {
    payload.error.details = details;
  }
  return NextResponse.json(payload, { status });
}

export function paginated<T>(data: T[], nextCursor: string | null, totalCount?: number): NextResponse {
  const payload: any = {
    success: true,
    data,
    meta: {
      nextCursor,
    },
  };
  if (totalCount !== undefined) {
    payload.meta.totalCount = totalCount;
  }
  return NextResponse.json(payload, { status: 200 });
}

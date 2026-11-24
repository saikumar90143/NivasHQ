import { NextRequest } from 'next/server';
import { parseSearchParams, withErrorHandler } from '@/lib/api-helpers';
import { success } from '@/lib/response';
import { locationSearchSchema } from '@/validators/search.validator';
import { SearchService } from '@/services/search.service';
import { ValidationError } from '@/lib/errors';

async function autocompleteHandler(req: NextRequest) {
  const searchParams = parseSearchParams(req.url);
  const paramsObj = Object.fromEntries(searchParams.entries());

  const result = locationSearchSchema.safeParse(paramsObj);
  if (!result.success) {
    throw new ValidationError(
      'Validation failed',
      result.error.flatten().fieldErrors as Record<string, string[]>
    );
  }

  const { q } = result.data;

  const data = await SearchService.autocomplete(q);

  return success(data);
}

export const GET = withErrorHandler(autocompleteHandler);

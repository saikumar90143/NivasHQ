import { NextRequest } from 'next/server';
import { parseSearchParams, withErrorHandler } from '@/lib/api-helpers';
import { success } from '@/lib/response';
import { propertySearchSchema } from '@/validators/search.validator';
import { SearchService } from '@/services/search.service';
import { ValidationError } from '@/lib/errors';

async function searchHandler(req: NextRequest) {
  const searchParams = parseSearchParams(req.url);
  
  const paramsObj: Record<string, any> = {};
  for (const [key, value] of searchParams.entries()) {
    if (paramsObj[key] !== undefined) {
      if (Array.isArray(paramsObj[key])) {
        paramsObj[key].push(value);
      } else {
        paramsObj[key] = [paramsObj[key], value];
      }
    } else {
      paramsObj[key] = value;
    }
  }

  const result = propertySearchSchema.safeParse(paramsObj);
  if (!result.success) {
    throw new ValidationError(
      'Validation failed',
      result.error.flatten().fieldErrors as Record<string, string[]>
    );
  }

  const { q, ...rest } = result.data;
  
  const data = await SearchService.searchProperties(result.data);

  return success(data);
}

export const GET = withErrorHandler(searchHandler);

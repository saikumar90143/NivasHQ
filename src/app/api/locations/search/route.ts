import { NextRequest } from 'next/server';
import { success } from '@/lib/response';
import { handleApiError } from '@/lib/errors';
import { locationSearchSchema } from '@/validators/search.validator';
import { db } from '@/lib/db';
import { CacheService } from '@/services/cache.service';
import { LocationLevel } from '@prisma/client';

/**
 * GET /api/locations/search?q=gachi&level=LOCALITY&limit=10
 * Location autocomplete — public endpoint, no auth required.
 * Returns locations hierarchically with parent name for display.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = locationSearchSchema.safeParse({
      q: searchParams.get('q') || '',
      limit: searchParams.get('limit') || 10,
      level: searchParams.get('level') || undefined,
    });

    if (!parsed.success) {
      return success({ results: [] });
    }

    const { q, limit, level } = parsed.data;

    if (!q || q.length < 1) {
      return success({ results: [] });
    }

    const cacheKey = `location:search:${q.toLowerCase()}:${level || 'all'}:${limit}`;

    const results = await CacheService.getOrSet(
      cacheKey,
      async () => {
        const locations = await db.location.findMany({
          where: {
            name: { contains: q, mode: 'insensitive' },
            ...(level ? { level: level as LocationLevel } : {}),
          },
          include: {
            parent: {
              select: { name: true, level: true },
            },
          },
          orderBy: [{ isPopular: 'desc' }, { name: 'asc' }],
          take: limit,
        });

        return locations.map((loc) => ({
          id: loc.id,
          name: loc.name,
          slug: loc.slug,
          level: loc.level,
          parentName: loc.parent?.name || null,
          parentLevel: loc.parent?.level || null,
          // Display label: "Gachibowli, Hyderabad"
          displayLabel:
            loc.parent?.name ? `${loc.name}, ${loc.parent.name}` : loc.name,
          isPopular: loc.isPopular,
          latitude: loc.latitude,
          longitude: loc.longitude,
        }));
      },
      300 // 5 minute cache for autocomplete
    );

    return success({ results });
  } catch (err) {
    return handleApiError(err);
  }
}

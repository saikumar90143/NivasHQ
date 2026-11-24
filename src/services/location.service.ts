import { db } from '@/lib/db';
import { CacheService } from './cache.service';
import { LocationLevel } from '@prisma/client';

export class LocationService {
  static async getLocationById(id: string) {
    return CacheService.getOrSet(CacheService.keys.location(id), async () => {
      return db.location.findUnique({ where: { id } });
    });
  }

  static async getLocationBySlug(slug: string, level?: LocationLevel) {
    return db.location.findFirst({
      where: {
        slug,
        ...(level ? { level } : {}),
      },
    });
  }

  static async getLocationHierarchy(id: string) {
    const hierarchy = [];
    let currentId: string | null = id;

    while (currentId) {
      const location = await this.getLocationById(currentId);
      if (!location) break;
      hierarchy.unshift(location);
      currentId = (location as any).parentId || null;
    }

    return hierarchy;
  }

  static async getChildLocations(parentId: string) {
    return db.location.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });
  }

  static async getPopularLocalities(cityId: string) {
    return CacheService.getOrSet(CacheService.keys.popularLocalities(), async () => {
      return db.location.findMany({
        where: { parentId: cityId, isPopular: true },
        take: 12,
        orderBy: { name: 'asc' },
      });
    }, 86400); // 1 day
  }

  static async getLocalityStats(localityId: string) {
    const [propertyCount, priceStats] = await Promise.all([
      db.property.count({ where: { localityId, status: 'ACTIVE' } }),
      db.property.aggregate({
        where: { localityId, status: 'ACTIVE' },
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    return {
      propertyCount,
      averagePrice: priceStats?._avg?.price || 0,
      minPrice: priceStats?._min?.price || 0,
      maxPrice: priceStats?._max?.price || 0,
    };
  }

  static async searchLocations(query: string) {
    if (!query || query.length < 2) return [];
    
    return db.location.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: 10,
    });
  }
}

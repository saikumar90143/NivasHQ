import { redis } from '@/lib/redis';

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  static async set(key: string, value: unknown, ttlSeconds: number = 3600): Promise<void> {
    try {
      const stringified = JSON.stringify(value, (key, val) =>
        typeof val === 'bigint' ? val.toString() : val
      );
      await redis.setex(key, ttlSeconds, stringified);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Cache del error for key ${key}:`, error);
    }
  }

  static async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Note: ioredis doesn't support wildcards in del directly without scanning,
      // for simple implementation we will use keys + pipeline
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache invalidatePattern error for pattern ${pattern}:`, error);
    }
  }

  // Key Generators
  static keys = {
    property: (id: string) => `property:${id}`,
    propertySlug: (slug: string) => `property:slug:${slug}`,
    featuredProperties: () => 'properties:featured',
    location: (id: string) => `location:${id}`,
    popularLocalities: () => 'locations:popular',
    searchResults: (queryHash: string) => `search:${queryHash}`,
  };
}

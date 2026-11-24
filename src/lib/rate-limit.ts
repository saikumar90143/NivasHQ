import { redis } from '@/lib/redis';

export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number; resetAt: Date }> {
  try {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;
    const key = `ratelimit:${identifier}`;

    // Sliding window logic using sorted sets
    await redis.zremrangebyscore(key, '-inf', windowStart);
    const currentCount = await redis.zcard(key);

    if (currentCount >= limit) {
      return {
        success: false,
        remaining: 0,
        resetAt: new Date(now + windowSeconds * 1000),
      };
    }

    await redis.zadd(key, now, now.toString() + Math.random().toString());
    await redis.expire(key, windowSeconds);

    return {
      success: true,
      remaining: limit - (currentCount + 1),
      resetAt: new Date(now + windowSeconds * 1000),
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open if Redis fails
    return {
      success: true,
      remaining: 1,
      resetAt: new Date(Date.now() + windowSeconds * 1000),
    };
  }
}

export const authRateLimit = async (ip: string) => rateLimit(`auth:login:${ip}`, 10, 15 * 60);
export const apiRateLimit = async (identifier: string) => rateLimit(`api:${identifier}`, 100, 60);
export const searchRateLimit = async (identifier: string) => rateLimit(`search:${identifier}`, 60, 60);

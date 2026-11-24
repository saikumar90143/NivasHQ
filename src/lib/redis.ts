import Redis from 'ioredis';

class InMemoryRedis {
  private map = new Map<string, { value: string; expiry: number | null }>();

  async get(key: string): Promise<string | null> {
    const data = this.map.get(key);
    if (!data) return null;
    if (data.expiry && Date.now() > data.expiry) {
      this.map.delete(key);
      return null;
    }
    return data.value;
  }

  async set(key: string, value: string): Promise<string> {
    this.map.set(key, { value, expiry: null });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const exists = this.map.has(key);
    this.map.delete(key);
    return exists ? 1 : 0;
  }

  async setex(key: string, seconds: number, value: string): Promise<string> {
    this.map.set(key, { value, expiry: Date.now() + seconds * 1000 });
    return 'OK';
  }
}

const redisUrl = process.env.REDIS_URL;
export const redis = redisUrl ? new Redis(redisUrl) : (new InMemoryRedis() as unknown as Redis);

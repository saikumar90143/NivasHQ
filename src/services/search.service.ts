import { CacheService } from './cache.service';
import { PropertySearchInput } from '@/validators/search.validator';
import { PostgresSearchRepository } from '@/repositories/search.repository';
import * as crypto from 'crypto';

const searchRepository = new PostgresSearchRepository();

function generateCacheKey(prefix: string, params: any): string {
  const hash = crypto.createHash('md5').update(JSON.stringify(params)).digest('hex');
  return `${prefix}:${hash}`;
}

export class SearchService {
  static async autocomplete(query: string) {
    if (!query || query.length < 2) return [];

    const cacheKey = `autocomplete:${query.toLowerCase().trim()}`;
    return CacheService.getOrSet(
      cacheKey,
      () => searchRepository.autocomplete(query),
      60 // 60s TTL as requested
    );
  }

  static async searchProperties(params: PropertySearchInput) {
    const cacheKey = generateCacheKey('search', params);
    
    return CacheService.getOrSet(
      cacheKey,
      () => searchRepository.searchProperties(params),
      60 // 60s TTL
    );
  }

  static async getPopularSearches() {
    return CacheService.getOrSet('popular:searches', async () => {
      // Normally this would aggregate analytics events
      return [
        'Villas in Gachibowli',
        '2 BHK in Kondapur',
        'Apartments in Jubilee Hills',
        'Plots in Mokila'
      ];
    }, 86400); // cache for 1 day
  }
}

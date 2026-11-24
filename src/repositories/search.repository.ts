import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { PropertySearchInput } from '@/validators/search.validator';

export interface ISearchRepository {
  searchProperties(params: PropertySearchInput): Promise<any>;
  autocomplete(query: string): Promise<any>;
}

export class PostgresSearchRepository implements ISearchRepository {
  async autocomplete(query: string) {
    if (!query || query.length < 2) return [];

    const [locations, properties] = await Promise.all([
      db.location.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 5,
        select: { id: true, name: true, slug: true }
      }),
      db.property.findMany({
        where: { title: { contains: query, mode: 'insensitive' }, status: 'ACTIVE' },
        take: 5,
        select: { id: true, title: true, slug: true }
      })
    ]);

    return [
      ...locations.map(l => ({ id: l.id, type: 'LOCATION', text: l.name, slug: l.slug })),
      ...properties.map(p => ({ id: p.id, type: 'PROPERTY', text: p.title, slug: p.slug }))
    ];
  }

  async searchProperties(params: PropertySearchInput) {
    const where: Prisma.PropertyWhereInput = { status: 'ACTIVE' };

    // Full-text search for `q` using Postgres to_tsvector and to_tsquery
    if (params.q) {
      const tsQuery = params.q.trim().split(/\s+/).join(' & ');
      // Fetch matching IDs via raw query
      const matchingIds: { id: string }[] = await db.$queryRaw`
        SELECT id FROM "Property"
        WHERE to_tsvector('english', title || ' ' || description) @@ to_tsquery('english', ${tsQuery})
        LIMIT 1000
      `;
      where.id = { in: matchingIds.map(m => m.id) };
    }

    // Map bounds (standard float comparisons)
    if (params.north !== undefined && params.south !== undefined && params.east !== undefined && params.west !== undefined) {
      where.latitude = { lte: params.north, gte: params.south };
      where.longitude = { lte: params.east, gte: params.west };
    }

    // Standard filters
    if (params.listingType) {
      where.listingType = params.listingType;
    }

    if (params.propertyType) {
      where.propertyType = params.propertyType;
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {};
      if (params.minPrice !== undefined) where.price.gte = BigInt(params.minPrice);
      if (params.maxPrice !== undefined) where.price.lte = BigInt(params.maxPrice);
    }

    if (params.bedrooms !== undefined) {
      where.bedrooms = params.bedrooms;
    }

    if (params.minArea !== undefined || params.maxArea !== undefined) {
      where.carpetArea = {};
      if (params.minArea !== undefined) where.carpetArea.gte = params.minArea;
      if (params.maxArea !== undefined) where.carpetArea.lte = params.maxArea;
    }

    if (params.furnishing) {
      where.furnishing = params.furnishing;
    }

    if (params.possessionStatus) {
      where.possessionStatus = params.possessionStatus;
    }

    if (params.reraApproved) {
      where.reraApproved = true;
    }

    if (params.verifiedOnly) {
      where.verificationStatus = 'VERIFIED';
    }

    if (params.isFeatured) {
      where.isFeatured = true;
    }
    
    if (params.localityId) {
      where.localityId = params.localityId;
    } else if (params.locality) {
      where.locality = { slug: params.locality };
    }

    // Determine sorting
    let orderBy: Prisma.PropertyOrderByWithRelationInput | Prisma.PropertyOrderByWithRelationInput[] = { createdAt: 'desc' };
    switch (params.sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'area_asc':
        orderBy = { carpetArea: 'asc' };
        break;
      case 'area_desc':
        orderBy = { carpetArea: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'newest':
      case 'relevance':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Execute query with keyset cursor pagination
    const properties = await db.property.findMany({
      where,
      orderBy,
      take: params.pageSize,
      skip: params.cursor ? 1 : 0,
      cursor: params.cursor ? { id: params.cursor } : undefined,
      include: {
        locality: {
          select: { name: true, slug: true }
        }
      }
    });

    // Get next cursor
    const nextCursor = properties.length === params.pageSize ? properties[properties.length - 1].id : null;

    // Convert BigInt to string before returning if necessary, but Prisma handles it or the caller handles it
    // For simplicity, we just return the payload
    return {
      data: properties.map(p => ({
        ...p,
        price: p.price.toString() // convert BigInt to string to avoid serialization issues
      })),
      nextCursor
    };
  }
}

import { db } from '@/lib/db';
import { MapBounds } from '@/types/api.types';
import { Prisma } from '@prisma/client';

export class GeoService {
  static async findPropertiesWithinRadius(lat: number, lng: number, radiusKm: number, filters: any = {}) {
    const radiusMeters = radiusKm * 1000;

    const conditions = [];
    conditions.push(Prisma.sql`status = 'ACTIVE'`);
    if (filters.type) conditions.push(Prisma.sql`type = ${filters.type}::"PropertyType"`);
    if (filters.listingType) conditions.push(Prisma.sql`"listingType" = ${filters.listingType}::"ListingType"`);
    if (filters.budgetMin) conditions.push(Prisma.sql`price >= ${filters.budgetMin}`);
    if (filters.budgetMax) conditions.push(Prisma.sql`price <= ${filters.budgetMax}`);

    const filterQuery = conditions.length ? Prisma.join(conditions, ' AND ') : Prisma.sql`1=1`;

    const properties = await db.$queryRaw`
      SELECT id, title, slug, price, "latitude", "longitude"
      FROM "Property"
      WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radiusMeters}
      )
      AND ${filterQuery}
      LIMIT 100
    `;

    return properties;
  }

  static async findPropertiesInBounds(bounds: MapBounds, filters: any = {}) {
    const { north, south, east, west } = bounds;

    const conditions = [];
    conditions.push(Prisma.sql`status = 'ACTIVE'`);
    if (filters.type) conditions.push(Prisma.sql`type = ${filters.type}::"PropertyType"`);
    if (filters.budgetMin) conditions.push(Prisma.sql`price >= ${filters.budgetMin}`);
    if (filters.budgetMax) conditions.push(Prisma.sql`price <= ${filters.budgetMax}`);

    const filterQuery = conditions.length ? Prisma.join(conditions, ' AND ') : Prisma.sql`1=1`;

    const properties = await db.$queryRaw`
      SELECT id, title, slug, price, "latitude", "longitude"
      FROM "Property"
      WHERE ST_Within(
        ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326),
        ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)
      )
      AND ${filterQuery}
      LIMIT 100
    `;

    return properties;
  }

  static async findNearbyPlaces(lat: number, lng: number, category: string, radiusKm: number = 2) {
    const radiusMeters = radiusKm * 1000;
    
    return db.$queryRawUnsafe(`
      SELECT id, name, category, distance
      FROM (
        SELECT id, name, category,
               ST_Distance(
                 ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography,
                 ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
               ) as distance
        FROM "NearbyPlace"
        WHERE category = '${category}'
      ) as subq
      WHERE distance <= ${radiusMeters}
      ORDER BY distance ASC
      LIMIT 10
    `);
  }

  static async calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const result: any[] = await db.$queryRaw`
      SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint(${lng1}, ${lat1}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lng2}, ${lat2}), 4326)::geography
      ) as distance
    `;
    
    return result[0]?.distance || 0;
  }
}

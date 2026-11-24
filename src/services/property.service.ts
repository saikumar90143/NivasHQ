import { db } from '@/lib/db';
import { CacheService } from './cache.service';
import { PropertySearchParams, CursorPaginatedResult } from '@/types';
import { canCreateListing, canFeatureProperty } from '@/lib/entitlements';
import { PaymentError } from '@/lib/errors';
import { PropertyStatus } from '@prisma/client';

export class PropertyService {
  static async searchProperties(
    params: PropertySearchParams
  ): Promise<CursorPaginatedResult<any>> {
    const {
      query,
      city,
      locality,
      listingType,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      furnishing,
      possessionStatus,
      verifiedOnly,
      amenities,
      reraApproved,
      sortBy,
      cursor,
      pageSize = 20,
    } = params;

    const where: any = { status: 'ACTIVE' };

    if (query) {
      where.title = { contains: query, mode: 'insensitive' };
    }
    if (locality) {
      where.locality = { slug: locality };
    }
    if (propertyType) {
      where.propertyType = Array.isArray(propertyType) ? { in: propertyType } : propertyType;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = BigInt(minPrice);
      if (maxPrice) where.price.lte = BigInt(maxPrice);
    }
    if (bedrooms) {
      where.bedrooms = Array.isArray(bedrooms) ? { in: bedrooms } : bedrooms;
    }
    if (bathrooms) {
      where.bathrooms = { gte: bathrooms };
    }
    if (city) {
      where.city = { slug: city };
    }
    if (listingType) {
      where.listingType = listingType;
    }
    if (minArea || maxArea) {
      where.carpetArea = {};
      if (minArea) where.carpetArea.gte = minArea;
      if (maxArea) where.carpetArea.lte = maxArea;
    }
    if (furnishing) {
      where.furnishing = furnishing;
    }
    if (possessionStatus) {
      where.possessionStatus = possessionStatus;
    }
    if (verifiedOnly) {
      where.verificationStatus = 'VERIFIED';
    }
    if (amenities && amenities.length > 0) {
      where.amenities = {
        some: {
          amenity: { name: { in: amenities, mode: 'insensitive' } } // Assuming matching by name
        }
      };
    }
    if (reraApproved) {
      where.reraApproved = true;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    if (sortBy === 'newest') orderBy = { createdAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    if (sortBy === 'area_asc') orderBy = { carpetArea: 'asc' };
    if (sortBy === 'area_desc') orderBy = { carpetArea: 'desc' };

    const items = await db.property.findMany({
      where,
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy,
      select: {
        id: true,
        slug: true,
        title: true,
        listingType: true,
        propertyType: true,
        status: true,
        verificationStatus: true,
        price: true,
        pricePerSqft: true,
        carpetArea: true,
        bedrooms: true,
        bathrooms: true,
        isFeatured: true,
        ownerId: true,
        agentId: true,
        builderId: true,
        createdAt: true,
        locality: { select: { name: true, slug: true } },
        city: { select: { name: true, slug: true } },
        images: { take: 1, select: { url: true } },
      },
    });

    let nextCursor: string | null = null;
    if (items.length > pageSize) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id || null;
    }

    return {
      data: items,
      nextCursor,
      prevCursor: null,
      hasMore: nextCursor !== null,
    };
  }

  static async searchPropertiesByBounds(
    minLat: number, minLng: number, maxLat: number, maxLng: number, limit = 100
  ) {
    return db.property.findMany({
      where: {
        status: 'ACTIVE',
        latitude: { gte: minLat, lte: maxLat },
        longitude: { gte: minLng, lte: maxLng },
      },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        propertyType: true,
        bedrooms: true,
        latitude: true,
        longitude: true,
      }
    });
  }

  static async getPropertyBySlug(slug: string) {
    const cacheKey = CacheService.keys.propertySlug(slug);
    return CacheService.getOrSet(cacheKey, async () => {
      return db.property.findUnique({
        where: { slug },
        include: {
          images: true,
          floorPlans: { orderBy: { sortOrder: 'asc' } },
          locality: true,
          city: true,
          agent: {
            include: { user: true }
          },
          builder: {
            include: { user: true }
          },
          amenities: {
            include: { amenity: true }
          },
        },
      });
    }, 3600);
  }

  static async getPropertyById(id: string) {
    return db.property.findUnique({
      where: { id },
      include: { images: true, locality: true },
    });
  }

  static async createProperty(data: any, identifiers: { agentId?: string; builderId?: string; ownerId?: string }) {
    if (identifiers.agentId) {
      const { allowed, reason } = await canCreateListing(identifiers.agentId);
      if (!allowed) {
        throw new PaymentError(reason);
      }

      if (data.localityId && data.propertyType && data.price) {
        const existing = await db.property.findFirst({
          where: {
            agentId: identifiers.agentId,
            localityId: data.localityId,
            propertyType: data.propertyType,
            price: data.price,
            status: { in: ['ACTIVE', 'PENDING_REVIEW'] }
          }
        });
        if (existing) {
          throw new Error("DUPLICATE_LISTING");
        }
      }
    }

    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const property = await db.property.create({
      data: {
        ...data,
        ...identifiers,
        expiresAt,
      },
    });
    
    // Cache is not currently used for latest properties
    
    return property;
  }

  static async updateProperty(id: string, data: any, identifiers: { agentId?: string; builderId?: string; ownerId?: string; isAdmin?: boolean }) {
    if (data.status) {
      throw new Error("Cannot update status directly. Use lifecycle methods.");
    }
    const where: any = { id };
    if (!identifiers.isAdmin) {
      if (identifiers.agentId) where.agentId = identifiers.agentId;
      else if (identifiers.builderId) where.builderId = identifiers.builderId;
      else if (identifiers.ownerId) where.ownerId = identifiers.ownerId;
    }

    const property = await db.property.update({
      where,
      data,
    });
    await CacheService.del(CacheService.keys.property(id));
    if (property.slug) {
      await CacheService.del(CacheService.keys.propertySlug(property.slug));
    }
    return property;
  }

  // --- LIFECYCLE ENGINE ---
  static async transitionPropertyState(id: string, toState: PropertyStatus, allowedFromStates: PropertyStatus[], adminId?: string) {
    const prop = await db.property.findUnique({ where: { id }, select: { status: true } });
    if (!prop) throw new Error("Property not found");
    if (!allowedFromStates.includes(prop.status as PropertyStatus)) {
      throw new Error(`Invalid state transition from ${prop.status} to ${toState}`);
    }
    
    const data: any = { status: toState };
    if (toState === 'ACTIVE') {
      data.publishedAt = new Date();
      if (adminId) {
        data.verificationStatus = 'VERIFIED';
        data.verifiedById = adminId;
        data.verificationDate = new Date();
      }
    }
    
    const updated = await db.property.update({ where: { id }, data });
    await CacheService.del(CacheService.keys.property(id));
    return updated;
  }

  static async submitForReview(id: string) {
    return this.transitionPropertyState(id, 'PENDING_REVIEW', ['DRAFT', 'INACTIVE']);
  }

  static async approveProperty(id: string, adminId: string) {
    return this.transitionPropertyState(id, 'ACTIVE', ['PENDING_REVIEW'], adminId);
  }

  static async rejectProperty(id: string) {
    return this.transitionPropertyState(id, 'DRAFT', ['PENDING_REVIEW']);
  }

  static async markAsSold(id: string) {
    return this.transitionPropertyState(id, 'SOLD', ['ACTIVE']);
  }

  static async markAsRented(id: string) {
    return this.transitionPropertyState(id, 'RENTED', ['ACTIVE']);
  }

  static async unpublishProperty(id: string) {
    return this.transitionPropertyState(id, 'INACTIVE', ['ACTIVE']);
  }
  // ------------------------

  static async deleteProperty(id: string, identifiers: { agentId?: string; builderId?: string; ownerId?: string; isAdmin?: boolean }) {
    const where: any = { id };
    if (!identifiers.isAdmin) {
      if (identifiers.agentId) where.agentId = identifiers.agentId;
      else if (identifiers.builderId) where.builderId = identifiers.builderId;
      else if (identifiers.ownerId) where.ownerId = identifiers.ownerId;
    }

    const property = await db.property.update({
      where,
      data: { status: 'DELETED' },
    });
    
    await CacheService.del(CacheService.keys.property(id));
    if (property.slug) {
      await CacheService.del(CacheService.keys.propertySlug(property.slug));
    }
    
    return property;
  }

  static async getFeaturedProperties(limit: number = 10) {
    return CacheService.getOrSet(CacheService.keys.featuredProperties(), async () => {
      return db.property.findMany({
        where: { isFeatured: true, status: 'ACTIVE' },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { images: { take: 1 }, locality: true },
      });
    }, 3600);
  }

  static async getLatestProperties(limit: number = 10) {
    return db.property.findMany({
      where: { status: 'ACTIVE' },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { images: { take: 1 }, locality: true },
    });
  }

  static async getPriceDropProperties(limit: number = 10) {
    return db.property.findMany({
      // We don't have hasPriceDrop in schema, fallback to recently updated
      where: { status: 'ACTIVE' },
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: { images: { take: 1 }, locality: true },
    });
  }

  static async getSimilarProperties(propertyId: string, limit: number = 3) {
    const prop = await this.getPropertyById(propertyId);
    if (!prop) return [];

    return db.property.findMany({
      where: {
        id: { not: propertyId },
        localityId: prop.localityId,
        propertyType: prop.propertyType,
        status: 'ACTIVE',
      },
      take: limit,
      include: { images: { take: 1 }, locality: true },
    });
  }

  static async getPropertiesByAgent(agentId: string, cursor?: string, limit = 20) {
    const items = await db.property.findMany({
      where: { agentId, status: { not: 'DELETED' } },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    let nextCursor: string | null = null;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id || null;
    }
    return { data: items, nextCursor };
  }

  static async getPropertiesByBuilder(builderId: string, cursor?: string, limit = 20) {
    const items = await db.property.findMany({
      where: { builderId, status: { not: 'DELETED' } },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    let nextCursor: string | null = null;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id || null;
    }
    return { data: items, nextCursor };
  }

  static async incrementViewCount(id: string) {
    return db.property.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  static async toggleFeatured(id: string, adminId: string) {
    // Basic implementation assuming only admins can hit this
    const prop = await db.property.findUnique({ where: { id } });
    if (!prop) throw new Error('Not found');
    
    if (!prop.isFeatured && prop.agentId) {
      const { allowed, reason } = await canFeatureProperty(prop.agentId);
      if (!allowed) {
        throw new PaymentError(reason);
      }
    }

    return db.property.update({
      where: { id },
      data: { isFeatured: !prop.isFeatured },
    });
  }
}

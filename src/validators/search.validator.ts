import { z } from 'zod';

export const propertySearchSchema = z.object({
  city: z.string().optional(),
  locality: z.string().optional(),
  localityId: z.string().uuid().optional(),
  listingType: z.enum(['SALE', 'RENT', 'LEASE']).optional(),
  propertyType: z.enum(['APARTMENT','VILLA','PLOT','INDEPENDENT_HOUSE','PENTHOUSE','STUDIO','COMMERCIAL_OFFICE','COMMERCIAL_SHOP','WAREHOUSE','FARM_HOUSE','PG','BUILDER_FLOOR']).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  bedrooms: z.coerce.number().min(1).max(10).optional(),
  minArea: z.coerce.number().nonnegative().optional(),
  maxArea: z.coerce.number().nonnegative().optional(),
  furnishing: z.enum(['UNFURNISHED','SEMI_FURNISHED','FULLY_FURNISHED']).optional(),
  possessionStatus: z.enum(['READY_TO_MOVE','UNDER_CONSTRUCTION','UPCOMING']).optional(),
  reraApproved: z.coerce.boolean().optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sortBy: z.enum(['relevance','price_asc','price_desc','newest','oldest','area_asc','area_desc']).optional().default('newest'),
  cursor: z.string().optional(),
  pageSize: z.coerce.number().min(1).max(50).optional().default(20),
  q: z.string().max(200).optional(),
  // Map bounds
  north: z.coerce.number().optional(),
  south: z.coerce.number().optional(),
  east: z.coerce.number().optional(),
  west: z.coerce.number().optional(),
});

export type PropertySearchInput = z.infer<typeof propertySearchSchema>;

export const locationSearchSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().min(1).max(20).optional().default(10),
  level: z.enum(['STATE','CITY','ZONE','LOCALITY','SUB_LOCALITY']).optional(),
});

export type LocationSearchInput = z.infer<typeof locationSearchSchema>;

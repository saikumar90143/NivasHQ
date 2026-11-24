import { z } from 'zod';
import xss from 'xss';

export const createPropertySchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100).transform(val => xss(val)),
  description: z.string().min(50, 'Description must be at least 50 characters').transform(val => xss(val)),
  type: z.enum(['APARTMENT', 'VILLA', 'INDEPENDENT_HOUSE', 'PLOT', 'COMMERCIAL', 'OFFICE']),
  listingType: z.enum(['SALE', 'RENT']),
  price: z.coerce.number().min(1000, 'Price must be valid'),
  area: z.coerce.number().min(50, 'Area must be at least 50 sqft'),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  furnishing: z.enum(['FULLY_FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']).optional(),
  facing: z.enum(['EAST', 'WEST', 'NORTH', 'SOUTH', 'NORTH_EAST']).optional(),
  possession: z.enum(['READY_TO_MOVE', 'UNDER_CONSTRUCTION']).optional(),
  locationId: z.string().uuid(),
  address: z.string().min(10),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  amenities: z.array(z.string()).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertySearchSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  listingType: z.enum(['SALE', 'RENT']).optional(),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  furnishing: z.string().optional(),
  possession: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().max(50).default(20),
});

export const propertySlugSchema = z.object({
  slug: z.string().min(3),
});

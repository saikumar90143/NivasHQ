import { NextResponse } from 'next/server';
import { getAuthenticatedUser, withErrorHandler, validateBody } from '@/lib/api-helpers';
import { requirePermission } from '@/lib/permissions';
import { createPropertySchema } from '@/validators/property.validator';
import { PropertyService } from '@/services/property.service';
import { success } from '@/lib/response';
import { db } from '@/lib/db';
import { NotFoundError, ValidationError } from '@/lib/errors';

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
}

export const POST = withErrorHandler(async (req: Request) => {
  const user = await getAuthenticatedUser(req);
  requirePermission(user.role, 'properties.create');

  const body = await validateBody(req, createPropertySchema);

  let identifiers: { agentId?: string; builderId?: string; ownerId?: string } = {};

  if (user.role === 'AGENT') {
    const agent = await db.agent.findUnique({ where: { userId: user.id } });
    if (!agent) throw new NotFoundError('Agent profile not found');
    identifiers.agentId = agent.id;
  } else if (user.role === 'BUILDER') {
    const builder = await db.builder.findUnique({ where: { userId: user.id } });
    if (!builder) throw new NotFoundError('Builder profile not found');
    identifiers.builderId = builder.id;
  } else {
    identifiers.ownerId = user.id;
  }

  // Resolve Location Hierarchy
  const locality = await db.location.findUnique({
    where: { id: body.locationId },
    include: { parent: { include: { parent: true } } },
  });

  if (!locality || locality.level !== 'LOCALITY') {
    throw new ValidationError('Invalid locality ID');
  }

  const cityId = locality.parentId;
  const stateId = locality.parent?.parentId;

  if (!cityId || !stateId) {
    throw new ValidationError('Location hierarchy incomplete');
  }

  // Map PropertyType
  let propertyType: any = body.type;
  if (body.type === 'COMMERCIAL') propertyType = 'COMMERCIAL_SHOP';
  if (body.type === 'OFFICE') propertyType = 'COMMERCIAL_OFFICE';

  const data = {
    title: body.title,
    description: body.description,
    listingType: body.listingType,
    propertyType,
    price: body.price,
    builtUpArea: body.area,
    bedrooms: body.bedrooms,
    bathrooms: body.bathrooms,
    furnishing: body.furnishing,
    facing: body.facing,
    possessionStatus: body.possession,
    localityId: body.locationId,
    cityId,
    stateId,
    address: body.address,
    latitude: body.latitude,
    longitude: body.longitude,
    slug: generateSlug(body.title),
    images: {
      create: body.images.map((url, index) => ({ url, sortOrder: index, isPrimary: index === 0 })),
    },
  };

  const property = await PropertyService.createProperty(data, identifiers);

  return success(property, { message: 'Property created successfully' }, 201);
});

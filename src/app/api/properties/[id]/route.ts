import { NextResponse } from 'next/server';
import { getAuthenticatedUser, withErrorHandler, validateBody } from '@/lib/api-helpers';
import { requirePermission, hasPermission } from '@/lib/permissions';
import { updatePropertySchema } from '@/validators/property.validator';
import { PropertyService } from '@/services/property.service';
import { success } from '@/lib/response';
import { db } from '@/lib/db';
import { NotFoundError, ForbiddenError } from '@/lib/errors';

export const PATCH = withErrorHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  
  const canUpdateAny = hasPermission(user.role, 'properties.update_any');
  const canUpdateOwn = hasPermission(user.role, 'properties.update_own');
  
  if (!canUpdateAny && !canUpdateOwn) {
    throw new ForbiddenError('Missing required permission to update property');
  }
  
  const body = await validateBody(req, updatePropertySchema);

  let identifiers: { agentId?: string; builderId?: string; ownerId?: string; isAdmin?: boolean } = {};
  
  if (canUpdateAny) {
    identifiers.isAdmin = true;
  } else {
    if (user.role === 'AGENT') {
      const agent = await db.agent.findUnique({ where: { userId: user.id } });
      if (agent) identifiers.agentId = agent.id;
    } else if (user.role === 'BUILDER') {
      const builder = await db.builder.findUnique({ where: { userId: user.id } });
      if (builder) identifiers.builderId = builder.id;
    } else {
      identifiers.ownerId = user.id;
    }
  }

  // Map updates
  const updateData: any = {};
  if (body.title) updateData.title = body.title;
  if (body.description) updateData.description = body.description;
  if (body.listingType) updateData.listingType = body.listingType;
  if (body.type) {
    updateData.propertyType = body.type;
    if (body.type === 'COMMERCIAL') updateData.propertyType = 'COMMERCIAL_SHOP';
    if (body.type === 'OFFICE') updateData.propertyType = 'COMMERCIAL_OFFICE';
  }
  if (body.price) updateData.price = body.price;
  if (body.area) updateData.builtUpArea = body.area;
  if (body.bedrooms !== undefined) updateData.bedrooms = body.bedrooms;
  if (body.bathrooms !== undefined) updateData.bathrooms = body.bathrooms;
  if (body.furnishing !== undefined) updateData.furnishing = body.furnishing;
  if (body.facing !== undefined) updateData.facing = body.facing;
  if (body.possession !== undefined) updateData.possessionStatus = body.possession;
  if (body.address !== undefined) updateData.address = body.address;
  if (body.latitude !== undefined) updateData.latitude = body.latitude;
  if (body.longitude !== undefined) updateData.longitude = body.longitude;
  
  try {
    const property = await PropertyService.updateProperty(id, updateData, identifiers);
    return success(property, { message: 'Property updated successfully' });
  } catch (err: any) {
    if (err.code === 'P2025') {
       throw new NotFoundError('Property not found or unauthorized');
    }
    throw err;
  }
});

export const DELETE = withErrorHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  
  const canDeleteAny = hasPermission(user.role, 'properties.delete_any');
  const canDeleteOwn = hasPermission(user.role, 'properties.delete_own');
  
  if (!canDeleteAny && !canDeleteOwn) {
    throw new ForbiddenError('Missing required permission to delete property');
  }

  let identifiers: { agentId?: string; builderId?: string; ownerId?: string; isAdmin?: boolean } = {};
  
  if (canDeleteAny) {
    identifiers.isAdmin = true;
  } else {
    if (user.role === 'AGENT') {
      const agent = await db.agent.findUnique({ where: { userId: user.id } });
      if (agent) identifiers.agentId = agent.id;
    } else if (user.role === 'BUILDER') {
      const builder = await db.builder.findUnique({ where: { userId: user.id } });
      if (builder) identifiers.builderId = builder.id;
    } else {
      identifiers.ownerId = user.id;
    }
  }

  try {
    await PropertyService.deleteProperty(id, identifiers);
    return success({ id }, { message: 'Property deleted successfully' });
  } catch (err: any) {
    if (err.code === 'P2025') {
       throw new NotFoundError('Property not found or unauthorized');
    }
    throw err;
  }
});

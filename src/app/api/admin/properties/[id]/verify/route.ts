import { NextResponse } from 'next/server';
import { getAuthenticatedUser, withErrorHandler, validateBody } from '@/lib/api-helpers';
import { requirePermission } from '@/lib/permissions';
import { success } from '@/lib/response';
import { db } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const verifySchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED', 'PENDING']),
  isFeatured: z.boolean().optional(),
});

export const PATCH = withErrorHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  requirePermission(user.role, 'properties.approve');

  const body = await validateBody(req, verifySchema);

  const data: any = {};
  if (body.status === 'VERIFIED') {
    data.verificationStatus = 'VERIFIED';
    data.status = 'ACTIVE';
    data.verifiedById = user.id;
    data.verificationDate = new Date();
    data.publishedAt = new Date();
  } else if (body.status === 'REJECTED') {
    data.verificationStatus = 'REJECTED';
    data.status = 'INACTIVE';
  } else if (body.status === 'PENDING') {
    data.verificationStatus = 'PENDING';
    data.status = 'PENDING_REVIEW';
  }

  if (body.isFeatured !== undefined) {
    data.isFeatured = body.isFeatured;
  }

  try {
    const property = await db.property.update({
      where: { id },
      data,
    });
    return success(property, { message: 'Property verification updated successfully' });
  } catch (err: any) {
    if (err.code === 'P2025') {
       throw new NotFoundError('Property not found');
    }
    throw err;
  }
});

import { NextRequest } from 'next/server';
import { generateSignedUploadParams } from '@/lib/cloudinary';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { success, error } from '@/lib/response';
import { handleApiError } from '@/lib/errors';
import { z } from 'zod';

const signUploadSchema = z.object({
  folder: z.enum(['properties', 'agents', 'builders', 'projects', 'documents']),
  publicId: z.string().max(200).optional(),
});

/**
 * POST /api/upload/sign
 * Returns a signed Cloudinary upload payload for direct browser-to-Cloudinary upload.
 * The binary file NEVER passes through our server.
 * Requires authentication.
 */
export async function POST(req: NextRequest) {
  try {
    await getAuthenticatedUser(req);

    const body = await req.json().catch(() => ({}));
    const parsed = signUploadSchema.safeParse(body);
    if (!parsed.success) {
      return error('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid input', 400);
    }

    const { folder, publicId } = parsed.data;
    const params = generateSignedUploadParams(folder, publicId);

    return success(params);
  } catch (err) {
    return handleApiError(err);
  }
}

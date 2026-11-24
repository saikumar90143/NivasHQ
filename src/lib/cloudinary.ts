import { v2 as cloudinary } from 'cloudinary';

// Server-side only — never import this in client components
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export default cloudinary;

/**
 * Generate a signed upload URL for direct browser-to-Cloudinary upload.
 * The file never passes through our Next.js server.
 */
export function generateSignedUploadParams(folder: string, publicId?: string) {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const params: Record<string, string | number> = {
    timestamp,
    folder,
    upload_preset: undefined as any,
    // Auto-generate responsive variants + WebP
    eager: 'w_800,h_600,c_limit,q_auto,f_webp|w_400,h_300,c_limit,q_auto,f_webp',
    eager_async: 'true',
  };

  if (publicId) params.public_id = publicId;

  // Remove undefined keys
  Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);

  return {
    signature,
    timestamp,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    folder,
    eager: params.eager,
    eager_async: params.eager_async,
  };
}

/**
 * Delete an asset from Cloudinary by public_id.
 */
export async function deleteCloudinaryAsset(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

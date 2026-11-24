import { v2 as cloudinary } from 'cloudinary';

// Ensure cloudinary is configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class ImageService {
  static async generateSignature(folder: string = 'properties') {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({
      timestamp,
      folder,
    }, process.env.CLOUDINARY_API_SECRET!);

    return {
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    };
  }

  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      console.error('Delete image failed:', error);
      return false;
    }
  }

  static getOptimizedUrl(url: string, width: number, height: number, format: string = 'webp'): string {
    // Basic optimization via Cloudinary URL params if it's a cloudinary URL
    if (url.includes('res.cloudinary.com')) {
      const parts = url.split('/upload/');
      return `${parts[0]}/upload/w_${width},h_${height},c_fill,f_${format}/${parts[1]}`;
    }
    return url;
  }

  static generateBlurPlaceholder(url: string): string {
    if (url.includes('res.cloudinary.com')) {
      const parts = url.split('/upload/');
      return `${parts[0]}/upload/w_20,c_fill,e_blur:1000/${parts[1]}`;
    }
    return url;
  }
}

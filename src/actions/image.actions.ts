"use server";

import { ImageService } from "@/services/image.service";

export async function generateImageUploadSignature(folder: string = 'properties') {
  return ImageService.generateSignature(folder);
}

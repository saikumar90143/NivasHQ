"use server";

import { PropertyService } from "@/services/property.service";

export async function searchPropertiesByBoundsAction(minLat: number, minLng: number, maxLat: number, maxLng: number) {
  try {
    const properties = await PropertyService.searchPropertiesByBounds(minLat, minLng, maxLat, maxLng, 100);
    return { success: true, data: properties };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

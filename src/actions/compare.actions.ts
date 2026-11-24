"use server";

import { db } from "@/lib/db";

export async function getPropertiesForCompareAction(ids: string[]) {
  try {
    if (!ids || ids.length === 0) return { success: true, data: [] };

    const properties = await db.property.findMany({
      where: { id: { in: ids } },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1
        },
        amenities: {
          include: {
            amenity: true
          }
        },
        city: true,
        locality: true,
      }
    });

    const formatted = properties.map(p => ({
      id: p.id,
      title: p.title,
      price: `₹${(Number(p.price) / 100000).toFixed(2)} Lacs`,
      bhk: p.bedrooms || 'N/A',
      area: p.carpetArea ? `${p.carpetArea} sq.ft` : 'N/A',
      bathrooms: p.bathrooms || 'N/A',
      facing: p.facing || 'N/A',
      furnishing: p.furnishing ? p.furnishing.replace(/_/g, ' ') : 'N/A',
      parking: p.parking || 'N/A',
      imageUrl: p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      amenities: p.amenities.map(a => a.amenity.name),
    }));

    // Ensure they match the order of IDs if possible, but map handles rendering fine.
    return { success: true, data: formatted };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

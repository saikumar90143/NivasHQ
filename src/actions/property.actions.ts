"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { ImageService } from "@/services/image.service";
import { PropertyService } from "@/services/property.service";

export async function createPropertyAction(formData: FormData) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const listingType = formData.get("listingType") as any;
    const propertyType = formData.get("propertyType") as any;
    const price = formData.get("price") as string;
    const carpetArea = formData.get("carpetArea") as string;
    const cityId = formData.get("cityId") as string;
    const localityId = formData.get("localityId") as string;
    
    const bedrooms = formData.get("bedrooms") ? parseInt(formData.get("bedrooms") as string) : undefined;
    const bathrooms = formData.get("bathrooms") ? parseInt(formData.get("bathrooms") as string) : undefined;
    const furnishing = formData.get("furnishing") as any || "UNFURNISHED";

    if (!title || !price || !cityId || !localityId) {
      return { success: false, error: "Missing required fields." };
    }

    // Fetch the city to find its parent stateId
    const city = await db.location.findUnique({
      where: { id: cityId },
      select: { parentId: true }
    });

    if (!city || !city.parentId) {
      return { success: false, error: "Invalid city selection." };
    }

    // Process Images uploaded directly to Cloudinary
    const imageUrls = formData.getAll("imageUrls") as string[];
    const uploadedImages = imageUrls.map(url => ({
      url,
      thumbnailUrl: url,
      blurDataUrl: url,
      mimeType: "image/jpeg",
      sizeBytes: 0, // Metadata would be ideally retrieved from Cloudinary, but 0 works for now
    }));

    // Generate a unique slug
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    // Determine the correct identifier based on user role
    const identifiers: any = {};
    const role = (session.user as any).role;
    
    if (role === 'AGENT') {
      const agent = await db.agent.findUnique({ where: { userId: session.user.id } });
      if (!agent) return { success: false, error: "Agent profile not found." };
      identifiers.agentId = agent.id;
    } else if (role === 'BUILDER') {
      const builder = await db.builder.findUnique({ where: { userId: session.user.id } });
      if (!builder) return { success: false, error: "Builder profile not found." };
      identifiers.builderId = builder.id;
    } else {
      identifiers.ownerId = session.user.id;
    }

    const propertyData = {
      title,
      description,
      slug,
      listingType,
      propertyType,
      price: BigInt(price),
      carpetArea: parseFloat(carpetArea),
      bedrooms,
      bathrooms,
      furnishing,
      cityId,
      localityId,
      stateId: city.parentId,
      status: 'DRAFT',
      verificationStatus: 'UNVERIFIED',
      images: {
        create: uploadedImages.map((img, idx) => ({
          ...img,
          isPrimary: idx === 0,
          sortOrder: idx
        }))
      }
    };

    const property = await PropertyService.createProperty(propertyData, identifiers);

    revalidatePath("/properties");
    revalidatePath("/buy");
    revalidatePath("/rent");
    revalidatePath("/dashboard/properties");

    return { 
      success: true, 
      propertyId: property.id,
      slug: property.slug
    };
  } catch (error: any) {
    console.error("Failed to create property:", error);
    return { success: false, error: error.message || "Failed to create property." };
  }
}

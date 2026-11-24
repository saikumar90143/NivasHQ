"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { AnalyticsService } from "@/services/analytics.service";

export async function toggleFavoriteAction(propertyId: string) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Please log in to save properties." };
    }

    const userId = session.user.id;

    const existing = await db.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existing) {
      await db.favorite.delete({
        where: {
          id: existing.id,
        },
      });
    } else {
      await db.favorite.create({
        data: {
          userId,
          propertyId,
        },
      });
      await AnalyticsService.trackEvent('FAVORITE', { propertyId, userId });
    }

    revalidatePath("/dashboard");
    return { success: true, isFavorited: !existing };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkIsFavoritedAction(propertyId: string) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return false;
    }

    const existing = await db.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: session.user.id,
          propertyId,
        },
      },
    });

    return !!existing;
  } catch {
    return false;
  }
}

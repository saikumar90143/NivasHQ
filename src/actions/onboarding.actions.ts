"use server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function completeOnboardingAction(data: {
  role: "BUYER" | "AGENT" | "BUILDER";
  companyName?: string;
  licenseNumber?: string;
}) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Start a transaction to update user role and create Agent/Builder record
    await db.$transaction(async (tx) => {
      // 1. Update the User role and onboarding status
      await tx.user.update({
        where: { id: userId },
        data: {
          role: data.role,
          onboardingCompleted: true,
        },
      });

      // 2. Create specific records based on role
      if (data.role === "AGENT") {
        await tx.agent.upsert({
          where: { userId },
          create: {
            userId,
            companyName: data.companyName,
            licenseNumber: data.licenseNumber,
          },
          update: {
            companyName: data.companyName,
            licenseNumber: data.licenseNumber,
          },
        });
      } else if (data.role === "BUILDER") {
        if (!data.companyName) {
          throw new Error("Company Name is required for Builders");
        }
        
        const slug = `${data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
        
        await tx.builder.upsert({
          where: { userId },
          create: {
            userId,
            companyName: data.companyName,
            slug,
          },
          update: {
            companyName: data.companyName,
          },
        });
      }
    });

    const cookieStore = await cookies();
    cookieStore.set("nivasahq_onboarded", "true", { path: "/" });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to complete onboarding:", error);
    return { success: false, error: error.message || "Failed to complete onboarding" };
  }
}

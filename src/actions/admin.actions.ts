"use server";

import { auth } from "@/lib/auth";
import { PropertyService } from "@/services/property.service";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    throw new Error("Unauthorized. Admins only.");
  }
  return session.user;
}

export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
    throw new Error("Unauthorized. Super Admins only.");
  }
  return session.user;
}

export async function approvePropertyAction(id: string) {
  try {
    const admin = await requireAdmin();
    await PropertyService.approveProperty(id, admin.id as string);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectPropertyAction(id: string) {
  try {
    await requireAdmin();
    await PropertyService.rejectProperty(id);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyAgentAction(id: string) {
  try {
    await requireAdmin();
    await db.agent.update({ where: { id }, data: { verificationStatus: 'VERIFIED' } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyBuilderAction(id: string) {
  try {
    await requireAdmin();
    await db.builder.update({ where: { id }, data: { verificationStatus: 'VERIFIED' } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { ReportReason } from "@prisma/client";

const reportSchema = z.object({
  reason: z.nativeEnum(ReportReason),
  description: z.string().optional()
});

export async function reportPropertyAction(propertyId: string, data: any) {
  try {
    const session = await auth();
    const reporterId = session?.user?.id as string | undefined;
    
    const parsed = reportSchema.parse(data);
    
    await db.report.create({
      data: {
        propertyId,
        reporterId,
        reason: parsed.reason,
        description: parsed.description,
        status: 'PENDING'
      }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reportAgentAction(agentId: string, data: any) {
  try {
    const session = await auth();
    const reporterId = session?.user?.id as string | undefined;
    
    const parsed = reportSchema.parse(data);
    
    await db.report.create({
      data: {
        agentId,
        reporterId,
        reason: parsed.reason,
        description: parsed.description,
        status: 'PENDING'
      }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

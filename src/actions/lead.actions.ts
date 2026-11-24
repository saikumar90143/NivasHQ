"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const enquirySchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  message: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export async function submitEnquiryAction(rawData: {
  propertyId: string;
  name: string;
  phone: string;
  email: string;
  message?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  try {
    const data = enquirySchema.parse(rawData);
    const session = await auth();
    const userId = session?.user?.id || null;

    // Check for recent duplicate lead (within 24 hours) for the same property
    const recentLead = await db.lead.findFirst({
      where: {
        propertyId: data.propertyId,
        phone: data.phone,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    if (recentLead) {
      return { success: false, error: "You have already enquired about this property recently." };
    }

    const lead = await db.lead.create({
      data: {
        propertyId: data.propertyId,
        userId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: data.message,
        source: "PROPERTY_ENQUIRY",
        status: "NEW",
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
      }
    });

    // We can emit an event or create a LeadEvent here
    await db.leadEvent.create({
      data: {
        leadId: lead.id,
        type: "CREATED",
        data: { message: "Lead submitted via property page" }
      }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit enquiry" };
  }
}

export async function bookSiteVisitAction(data: {
  propertyId: string;
  agentId: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    // Check for duplicate site visit requested
    const recentAppointment = await db.appointment.findFirst({
      where: {
        propertyId: data.propertyId,
        userPhone: data.phone,
        scheduledDate: new Date(data.date),
      }
    });

    if (recentAppointment) {
      return { success: false, error: "You already have a site visit scheduled for this property on this date." };
    }

    // Since a site visit is also a lead, we can create a lead first
    const lead = await db.lead.create({
      data: {
        propertyId: data.propertyId,
        userId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: `Requested Site Visit on ${data.date} at ${data.time}`,
        source: "SITE_VISIT_REQUEST",
        status: "NEW",
      }
    });

    await db.appointment.create({
      data: {
        leadId: lead.id,
        propertyId: data.propertyId,
        agentId: data.agentId,
        userId,
        userPhone: data.phone,
        scheduledDate: new Date(data.date),
        scheduledTime: data.time,
        status: "REQUESTED",
        notes: "Site visit requested from website",
      }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to book site visit" };
  }
}

export async function cancelSiteVisitAction(appointmentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const appointment = await db.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment || appointment.userId !== session.user.id) {
      return { success: false, error: "Appointment not found or unauthorized" };
    }

    await db.appointment.update({
      where: { id: appointmentId },
      data: { status: "CANCELLED" }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to cancel site visit" };
  }
}

export async function rescheduleSiteVisitAction(appointmentId: string, newDate: string, newTime: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const appointment = await db.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment || appointment.userId !== session.user.id) {
      return { success: false, error: "Appointment not found or unauthorized" };
    }

    await db.appointment.update({
      where: { id: appointmentId },
      data: { 
        scheduledDate: new Date(newDate),
        scheduledTime: newTime,
        status: "REQUESTED" 
      }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reschedule site visit" };
  }
}

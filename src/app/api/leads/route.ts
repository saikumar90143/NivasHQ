import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { queues } from '@/lib/queue';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.name || !data.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const lead = await db.$transaction(async (tx) => {
      const newLead = await tx.lead.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          message: data.message,
          propertyId: data.propertyId,
          preferredContact: data.preferredContact || 'PHONE',
          status: 'NEW',
          source: data.source || 'PROPERTY_ENQUIRY'
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'LEAD_CREATED',
          entityType: 'LEAD',
          entityId: newLead.id,
          newValues: { status: 'NEW' }
        }
      });

      return newLead;
    });

    await queues.leadMatching.add('LeadMatchingJob', { leadId: lead.id });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

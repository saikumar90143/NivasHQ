import { db } from '@/lib/db';
import { AnalyticsService } from './analytics.service';
import { LeadStatus, Prisma } from '@prisma/client';
import { RankingService } from './ranking.service';
import { queues } from '@/lib/queue';
import crypto from 'crypto';

export class LeadService {
  static async createLead(data: any) {
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
        },
      });

      const correlationId = data.correlationId || crypto.randomUUID();

      await tx.leadEvent.create({
        data: {
          leadId: newLead.id,
          type: 'LEAD_CREATED',
          data: { ...data, correlationId }
        }
      });

      return { newLead, correlationId };
    });

    // Queue job AFTER transaction commits
    await queues.leadMatching.add('LeadMatchingJob', {
      leadId: lead.newLead.id,
      eventId: 'LEAD_CREATED',
      correlationId: lead.correlationId,
      createdAt: new Date().toISOString()
    });

    return lead.newLead;
  }

  static async getLeadById(id: string) {
    return db.lead.findUnique({
      where: { id },
      include: { property: true, assignments: { include: { agent: true } } },
    });
  }

  static async getLeadsByAgent(agentId: string, cursor?: string, limit = 20) {
    const items = await db.lead.findMany({
      where: { assignments: { some: { agentId } } },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { property: true },
    });

    let nextCursor: string | null = null;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id || null;
    }
    return { data: items, nextCursor };
  }

  static async getLeadsByProperty(propertyId: string) {
    return db.lead.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateLeadStatus(id: string, status: LeadStatus, agentId: string) {
    const lead = await db.lead.findFirst({
      where: { id, assignments: { some: { agentId } } }
    });
    
    if (!lead) throw new Error('Lead not found or not assigned to this agent');

    // FSM State Transition Validation
    const validTransitions: Record<LeadStatus, LeadStatus[]> = {
      NEW: ['ASSIGNED', 'SPAM'],
      ASSIGNED: ['CONTACTED', 'SPAM'],
      CONTACTED: ['SITE_VISIT_SCHEDULED', 'NEGOTIATION', 'CLOSED_LOST'],
      SITE_VISIT_SCHEDULED: ['SITE_VISIT_DONE', 'CLOSED_LOST'],
      SITE_VISIT_DONE: ['NEGOTIATION', 'CLOSED_LOST', 'CLOSED_WON'],
      NEGOTIATION: ['CLOSED_WON', 'CLOSED_LOST'],
      CLOSED_WON: [],
      CLOSED_LOST: [],
      SPAM: []
    };

    if (!validTransitions[lead.status].includes(status)) {
      throw new Error(`Invalid state transition from ${lead.status} to ${status}`);
    }
    
    const updatedLead = await db.lead.update({
      where: { id },
      data: { status },
    });

    await AnalyticsService.trackEvent('LEAD_STAGE_CHANGED', {
      leadId: id,
      agentId,
      oldStatus: lead.status,
      newStatus: status
    });

    return updatedLead;
  }

  // Renamed from processLeadMatchJob to processLeadMatch to decouple from BullMQ directly
  static async processLeadMatch(leadId: string) {
    const assigned = await db.$transaction(async (tx) => {
      // 1. Fetch Lead
      const lead = await tx.lead.findUnique({
        where: { id: leadId },
        include: { property: true }
      });

      // Idempotency / Safety check
      if (!lead || lead.status !== 'NEW') {
        return null;
      }

      let targetAgentId = lead.property?.agentId;

      if (!targetAgentId) {
        // Filter -> Candidates -> Rank -> Top K (Agent Matching)
        const agents = await tx.agent.findMany({
          where: { verificationStatus: 'VERIFIED' },
          include: { areasServed: true }
        });
        const rankedAgents = await RankingService.rankAgents(agents, lead.property);
        
        if (rankedAgents.length > 0) {
           targetAgentId = rankedAgents[0].id;
        }
      }

      if (targetAgentId) {
        // Verify lead is still unassigned is naturally handled by the transaction's isolation
        await tx.leadAssignment.create({
          data: {
            leadId,
            agentId: targetAgentId,
            status: 'ASSIGNED'
          }
        });
        
        await tx.lead.update({
          where: { id: leadId },
          data: { status: 'ASSIGNED' }
        });

        await tx.leadEvent.create({
          data: {
            leadId,
            type: 'LEAD_ASSIGNED',
            data: { agentId: targetAgentId }
          }
        });

        return { leadId, targetAgentId };
      }

      return null;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }); 

    if (assigned) {
      await queues.notifications.add('NotificationJob', {
        type: 'LEAD_ASSIGNED',
        leadId: assigned.leadId,
        agentId: assigned.targetAgentId,
        createdAt: new Date().toISOString()
      });
    }
  }
}

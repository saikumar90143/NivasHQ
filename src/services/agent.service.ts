import { db } from '@/lib/db';
import { CacheService } from './cache.service';

export class AgentService {
  static async getAgentByUserId(userId: string) {
    return db.agent.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true, avatarUrl: true } } },
    });
  }

  static async getAgentById(id: string) {
    return db.agent.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true, avatarUrl: true } } },
    });
  }

  static async getVerifiedAgents(limit: number = 10) {
    return CacheService.getOrSet(`agents:verified:${limit}`, async () => {
      return db.agent.findMany({
        where: { verificationStatus: 'VERIFIED' },
        take: limit,
        orderBy: { rating: 'desc' },
        include: { user: { select: { name: true, avatarUrl: true } } },
      });
    }, 3600);
  }

  static async updateAgentProfile(id: string, data: any) {
    return db.agent.update({
      where: { id },
      data,
    });
  }

  static async getAgentStats(id: string) {
    const listingsCount = await db.property.count({ where: { agentId: id, status: 'ACTIVE' } });
    const leadsCount = await db.lead.count({ where: { assignments: { some: { agentId: id } } } });
    const dealsCount = await db.lead.count({ where: { assignments: { some: { agentId: id } }, status: 'CLOSED_WON' } });
    const conversionRate = leadsCount > 0 ? (dealsCount / leadsCount) * 100 : 0;

    return {
      listings: listingsCount,
      leads: leadsCount,
      deals: dealsCount,
      conversionRate: Math.round(conversionRate * 100) / 100, // round to 2 decimal places
    };
  }

  static async getTopAgents(localityId?: string, limit: number = 10) {
    // Base implementation. In a real scenario we might filter by locality mapping
    return db.agent.findMany({
      where: { verificationStatus: 'VERIFIED' },
      take: limit,
      orderBy: { rating: 'desc' },
      include: { user: { select: { name: true, avatarUrl: true } } },
    });
  }
}

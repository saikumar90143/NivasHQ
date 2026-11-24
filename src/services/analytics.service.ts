import { db } from '@/lib/db';
import { queues } from '@/lib/queue';

export class AnalyticsService {
  static async trackEvent(eventType: string, data: any) {
    try {
      await queues.analytics.add('track-event', {
        eventType,
        data,
        userId: data?.userId,
        propertyId: data?.propertyId,
        sessionId: data?.sessionId,
        utmSource: data?.utmSource,
        utmMedium: data?.utmMedium,
        utmCampaign: data?.utmCampaign,
        referrer: data?.referrer,
        landingPage: data?.landingPage
      });
    } catch (error) {
      console.error('Failed to queue analytics event:', error);
    }
  }

  static async trackPropertyView(propertyId: string, userId?: string, sessionId?: string) {
    this.trackEvent('PROPERTY_VIEW', { propertyId, userId, sessionId });
  }

  static async trackSearch(query: string, filters: any, resultCount: number) {
    this.trackEvent('SEARCH', { query, filters, resultCount });
  }

  static async trackEnquiry(propertyId: string, leadId: string) {
    this.trackEvent('ENQUIRY', { propertyId, leadId });
  }

  static async trackWhatsAppClick(propertyId: string, agentId: string) {
    this.trackEvent('WHATSAPP_CLICK', { propertyId, agentId });
  }

  static async getPropertyAnalytics(propertyId: string) {
    const views = await db.analyticsEvent.count({
      where: { propertyId, eventType: 'PROPERTY_VIEW' }
    });
    const enquiries = await db.analyticsEvent.count({
      where: { propertyId, eventType: 'ENQUIRY' }
    });
    const whatsappClicks = await db.analyticsEvent.count({
      where: { propertyId, eventType: 'WHATSAPP_CLICK' }
    });

    return { views, enquiries, whatsappClicks };
  }

  static async getDashboardStats(dateRange?: { start: Date; end: Date }) {
    const dateFilter = dateRange ? {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    } : {};

    const [totalProperties, activeAgents, totalLeads] = await Promise.all([
      db.property.count({ where: { status: 'ACTIVE', ...dateFilter } }),
      db.agent.count({ where: { verificationStatus: 'VERIFIED', ...dateFilter } }),
      db.lead.count({ where: dateFilter }),
    ]);

    return { totalProperties, activeAgents, totalLeads };
  }

  static async getTopProperties(limit: number = 10) {
    return db.property.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { viewCount: 'desc' },
      take: limit,
      include: { locality: true }
    });
  }

  static async getTopLocalities(limit: number = 10) {
    // In a real app we would aggregate search events or view counts per locality.
    return db.location.findMany({
      where: { isPopular: true },
      take: limit
    });
  }
}

import { Job } from 'bullmq';
import { db } from '@/lib/db';

export interface AnalyticsJobData {
  eventType: string;
  data?: any;
  userId?: string;
  propertyId?: string;
  sessionId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  landingPage?: string;
}

export default async function processAnalyticsJob(job: Job<AnalyticsJobData>) {
  try {
    const { eventType, data, userId, propertyId, sessionId, utmSource, utmMedium, utmCampaign, referrer, landingPage } = job.data;
    
    await db.analyticsEvent.create({
      data: {
        eventType,
        data: data ? JSON.parse(JSON.stringify(data)) : undefined,
        userId,
        propertyId,
        sessionId,
        utmSource,
        utmMedium,
        utmCampaign,
        referrer,
        landingPage
      }
    });

    if (eventType === 'PROPERTY_VIEW' && propertyId) {
      try {
        await db.property.update({
          where: { id: propertyId },
          data: { viewCount: { increment: 1 } }
        });
      } catch (e) {
        // Ignore if property doesn't exist
      }
    }
  } catch (error) {
    console.error(`[JOB:analytics] Failed to log analytics event:`, error);
    throw error;
  }
}

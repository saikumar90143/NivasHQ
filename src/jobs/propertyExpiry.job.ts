import { Job } from 'bullmq';
import { db } from '@/lib/db';

export default async function processPropertyExpiryJob(job: Job) {
  console.log(`[property-expiry] Processing job ${job.id}...`);

  const expiredProperties = await db.property.updateMany({
    where: {
      expiresAt: { lt: new Date() },
      status: 'ACTIVE',
    },
    data: { status: 'EXPIRED' }
  });

  console.log(`[property-expiry] Expired ${expiredProperties.count} stale properties.`);
  
  return { expiredCount: expiredProperties.count };
}

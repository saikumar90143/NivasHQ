import { Job } from 'bullmq';
import { NotificationService } from '@/services/notification.service';

export interface NotificationJobData {
  notificationId: string;
  type: string;
  leadId?: string;
  agentId?: string;
  correlationId?: string;
  eventId?: string;
  createdAt: string;
}

export default async function processNotificationsJob(job: Job<NotificationJobData>) {
  console.log(`[JOB:notifications] Starting job ${job.id} for notification ${job.data.notificationId || job.data.type}`);
  
  try {
    const jobData = {
      ...job.data,
      attempt: job.attemptsMade + 1,
      maxAttempts: job.opts.attempts || 5,
      jobId: job.id,
    };
    
    await NotificationService.processNotificationJob(jobData);
    
    console.log(`[JOB:notifications] Completed job ${job.id}`);
  } catch (error) {
    console.error(`[JOB:notifications] Failed job ${job.id}:`, error);
    throw error;
  }
}

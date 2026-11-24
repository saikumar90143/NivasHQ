import { Job } from 'bullmq';
import { LeadService } from '@/services/lead.service';

export interface LeadMatchingJobData {
  leadId: string;
  correlationId?: string;
  eventId?: string;
  createdAt: string;
}

export default async function processLeadMatchingJob(job: Job<LeadMatchingJobData>) {
  console.log(`[JOB:lead-matching] Starting job ${job.id} for lead ${job.data.leadId}`);
  
  try {
    const jobData = {
      ...job.data,
      attempt: job.attemptsMade + 1,
      jobId: job.id,
    };
    
    await LeadService.processLeadMatch(jobData.leadId);
    
    console.log(`[JOB:lead-matching] Completed job ${job.id}`);
  } catch (error) {
    console.error(`[JOB:lead-matching] Failed job ${job.id}:`, error);
    throw error; // Let BullMQ handle retries and DLQ
  }
}

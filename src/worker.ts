import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { processLeadMatchingJob, processNotificationsJob, processPropertyExpiryJob, processAnalyticsJob } from './jobs';
import { queues } from './lib/queue';
import http from 'http';

const redisUrl = process.env.BULLMQ_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

console.log('Worker process starting up...');

// Configure concurrency limits
const LEAD_MATCHING_CONCURRENCY = parseInt(process.env.LEAD_MATCHING_CONCURRENCY || '5', 10);
const NOTIFICATIONS_CONCURRENCY = parseInt(process.env.NOTIFICATIONS_CONCURRENCY || '10', 10);

const leadMatchingWorker = new Worker('lead-matching', processLeadMatchingJob, { 
  connection,
  concurrency: LEAD_MATCHING_CONCURRENCY
});

const notificationsWorker = new Worker('notifications', processNotificationsJob, { 
  connection,
  concurrency: NOTIFICATIONS_CONCURRENCY
});

const propertyExpiryWorker = new Worker('property-expiry', processPropertyExpiryJob, {
  connection,
  concurrency: 1
});

const analyticsWorker = new Worker('analytics', processAnalyticsJob, {
  connection,
  concurrency: 10
});

// Schedule the repeatable expiry job
queues.propertyExpiry.upsertJobScheduler('daily-expiry-check', {
  pattern: '0 0 * * *'
});

// Health check server for Kubernetes / ECS
const healthPort = process.env.WORKER_HEALTH_PORT || 8080;
const healthServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end();
  }
});
healthServer.listen(healthPort, () => {
  console.log(`Worker health server listening on port ${healthPort}`);
});

leadMatchingWorker.on('active', (job) => {
  console.log(`[lead-matching] Job ${job.id} active`);
});

leadMatchingWorker.on('completed', (job) => {
  console.log(`[lead-matching] Job ${job.id} completed successfully`);
});

leadMatchingWorker.on('failed', (job, err) => {
  console.error(`[lead-matching] Job ${job?.id} failed:`, err);
});

notificationsWorker.on('active', (job) => {
  console.log(`[notifications] Job ${job.id} active`);
});

notificationsWorker.on('completed', (job) => {
  console.log(`[notifications] Job ${job.id} completed successfully`);
});

notificationsWorker.on('failed', (job, err) => {
  console.error(`[notifications] Job ${job?.id} failed:`, err);
});

// Graceful Shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing workers gracefully...`);
  await Promise.all([
    leadMatchingWorker.close(),
    notificationsWorker.close(),
    propertyExpiryWorker.close(),
    analyticsWorker.close(),
  ]);
  healthServer.close();
  console.log('Workers closed.');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

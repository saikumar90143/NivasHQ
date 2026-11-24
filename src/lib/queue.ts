import { Queue, DefaultJobOptions } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.BULLMQ_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';
export const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

const defaultJobOptions: DefaultJobOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
};

export const queues = {
  leadMatching: new Queue('lead-matching', { connection, defaultJobOptions }),
  propertyMatching: new Queue('property-matching', { connection, defaultJobOptions }),
  notifications: new Queue('notifications', { connection, defaultJobOptions }),
  analytics: new Queue('analytics', { connection, defaultJobOptions }),
  propertyIndexing: new Queue('property-indexing', { connection, defaultJobOptions }),
  imageProcessing: new Queue('image-processing', { connection, defaultJobOptions }),
  propertyExpiry: new Queue('property-expiry', { connection, defaultJobOptions }),
  priceAlerts: new Queue('price-alerts', { connection, defaultJobOptions }),
  sitemap: new Queue('sitemap', { connection, defaultJobOptions }),
};

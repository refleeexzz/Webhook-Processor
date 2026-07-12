import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from './env';

const connection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

export const eventQueue = new Queue('events', { connection });
export const webhookDeliveryQueue = new Queue('webhook-deliveries', { connection });

export { connection as redisConnection };

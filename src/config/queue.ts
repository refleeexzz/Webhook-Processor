import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from './env';

export const redisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
};

const connection = new Redis(redisOptions);

export const eventQueue = new Queue('events', { connection: redisOptions });
export const webhookDeliveryQueue = new Queue('webhook-deliveries', { connection: redisOptions });

export { connection as redisConnection };

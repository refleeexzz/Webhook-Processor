import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from './env';

const redisConnection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

const queueConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
};

export const eventQueue = new Queue('events', { connection: queueConnection });
export const webhookDeliveryQueue = new Queue('webhook-deliveries', { connection: queueConnection });

export { redisConnection, queueConnection };

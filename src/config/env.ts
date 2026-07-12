import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  PORT: z.coerce.number().default(3000),
  API_SECRET: z.string(),
  WORKER_CONCURRENCY: z.coerce.number().default(5),
  WEBHOOK_TIMEOUT_MS: z.coerce.number().default(5000),
  MAX_RETRY_ATTEMPTS: z.coerce.number().default(5),
});

export const env = envSchema.parse(process.env);

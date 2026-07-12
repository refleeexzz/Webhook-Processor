import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisConnection } from '../config/queue';
import { env } from '../config/env';

// general api rate limiter
export const apiRateLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error - type mismatch between redis and rate-limit-redis
    sendCommand: (...args: string[]) => redisConnection.call(...args),
  }),
  windowMs: 60 * 1000,
  max: env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// strict rate limiter for event creation (fintech pattern)
export const createEventRateLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error - type mismatch between redis and rate-limit-redis
    sendCommand: (...args: string[]) => redisConnection.call(...args),
  }),
  windowMs: 60 * 1000,
  max: env.NODE_ENV === 'production' ? 10 : 100,
  message: {
    success: false,
    error: 'Event creation rate limit exceeded. Max 10 events per minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // rate limit by ip, could add api key later
    return req.ip || 'unknown';
  },
});

// rate limiter for webhook operations
export const webhookRateLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error - type mismatch between redis and rate-limit-redis
    sendCommand: (...args: string[]) => redisConnection.call(...args),
  }),
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Webhook operation rate limit exceeded.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

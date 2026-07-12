import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisConnection } from '../config/queue';
import { env } from '../config/env';

// Rate limiter geral para toda a API
export const apiRateLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore - Types mismatch between redis and rate-limit-redis
    sendCommand: (...args: string[]) => redisConnection.call(...args),
  }),
  windowMs: 60 * 1000, // 1 minuto
  max: env.NODE_ENV === 'production' ? 100 : 1000, // 100 req/min em prod
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Rate limiter estrito para criação de eventos (simula fintech)
export const createEventRateLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redisConnection.call(...args),
  }),
  windowMs: 60 * 1000, // 1 minuto
  max: env.NODE_ENV === 'production' ? 10 : 100, // 10 events/min em prod
  message: {
    success: false,
    error: 'Event creation rate limit exceeded. Max 10 events per minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit por IP + opcional API key no futuro
    return req.ip || 'unknown';
  },
});

// Rate limiter para webhooks
export const webhookRateLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redisConnection.call(...args),
  }),
  windowMs: 60 * 1000,
  max: 20, // 20 webhook operations/min
  message: {
    success: false,
    error: 'Webhook operation rate limit exceeded.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

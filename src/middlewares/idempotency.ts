import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

/**
 * idempotency middleware
 *
 * ensures duplicate requests (same idempotency-key) return the same response
 * without reprocessing. essential for financial operations where duplicates
 * could cause multiple charges.
 *
 * client should send header: idempotency-key: <uuid>
 */
export function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

  // no key means continue normally (not required for get/delete)
  if (!idempotencyKey) {
    return next();
  }

  // validate uuid format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(idempotencyKey)) {
    res.status(400).json({
      success: false,
      error: 'Invalid Idempotency-Key format. Must be a valid UUID.',
    });
    return;
  }

  // check if cached response exists
  prisma.idempotencyCache
    .findUnique({
      where: { key: idempotencyKey },
    })
    .then((cached) => {
      if (cached) {
        // check if not expired
        if (cached.expiresAt > new Date()) {
          logger.info('Idempotency key hit', {
            key: idempotencyKey,
            path: req.path,
          });

          // return cached response
          res.status(cached.statusCode).json(cached.response);
          return;
        } else {
          // expired, remove from cache
          prisma.idempotencyCache.delete({
            where: { key: idempotencyKey },
          }).catch(() => {
            // ignore delete errors
          });
        }
      }

      // doesn't exist or expired, continue processing
      // intercept response to cache it
      const originalJson = res.json.bind(res);

      res.json = function (data: any) {
        const statusCode = res.statusCode;

        // only cache success responses (2xx)
        if (statusCode >= 200 && statusCode < 300) {
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24); // 24h cache

          prisma.idempotencyCache.create({
            data: {
              key: idempotencyKey,
              response: data,
              statusCode,
              expiresAt,
            },
          }).catch((error) => {
            logger.error('Failed to cache idempotency response', error, {
              key: idempotencyKey,
            });
          });
        }

        return originalJson(data);
      };

      next();
    })
    .catch((error) => {
      logger.error('Idempotency middleware error', error);
      // on cache error, continue normal processing
      next();
    });
}

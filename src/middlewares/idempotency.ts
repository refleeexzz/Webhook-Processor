import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

/**
 * Middleware de idempotência
 *
 * Garante que requisições duplicadas (mesmo idempotency-key) retornem
 * a mesma resposta sem reprocessar. Essencial para operações financeiras
 * onde duplicação pode causar cobranças múltiplas.
 *
 * Cliente deve enviar header: Idempotency-Key: <uuid>
 */
export function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

  // Se não tem key, continua normalmente (não obrigatório para GET/DELETE)
  if (!idempotencyKey) {
    return next();
  }

  // Validar formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(idempotencyKey)) {
    res.status(400).json({
      success: false,
      error: 'Invalid Idempotency-Key format. Must be a valid UUID.',
    });
    return;
  }

  // Verificar se já existe resposta cacheada
  prisma.idempotencyCache
    .findUnique({
      where: { key: idempotencyKey },
    })
    .then((cached) => {
      if (cached) {
        // Verificar se não expirou
        if (cached.expiresAt > new Date()) {
          logger.info('Idempotency key hit', {
            key: idempotencyKey,
            path: req.path,
          });

          // Retornar resposta cacheada
          res.status(cached.statusCode).json(cached.response);
          return;
        } else {
          // Expirou, remover do cache
          prisma.idempotencyCache.delete({
            where: { key: idempotencyKey },
          }).catch(() => {
            // Ignore delete errors
          });
        }
      }

      // Não existe ou expirou, continuar processamento
      // Interceptar a resposta para cachear
      const originalJson = res.json.bind(res);

      res.json = function (data: any) {
        const statusCode = res.statusCode;

        // Cachear apenas respostas de sucesso (2xx)
        if (statusCode >= 200 && statusCode < 300) {
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24); // 24h de cache

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
      // Em caso de erro no cache, continua processamento normal
      next();
    });
}

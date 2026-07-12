import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface AuditMetadata {
  entityType: string;
  entityId?: string;
  action: string;
}

/**
 * audit middleware
 * logs all important actions for compliance tracking
 */
export function auditLogger(metadata: AuditMetadata) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      // only log successful responses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = metadata.entityId || data?.data?.id || 'unknown';

        prisma.auditLog.create({
          data: {
            action: metadata.action,
            entityType: metadata.entityType,
            entityId: String(entityId),
            userId: req.headers['x-user-id'] as string | undefined,
            ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
            userAgent: req.headers['user-agent'],
            metadata: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              body: req.body,
            },
          },
        }).catch((error) => {
          logger.error('Failed to create audit log', error, {
            action: metadata.action,
            entityType: metadata.entityType,
          });
        });
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * helper to create audit logs manually
 */
export async function createAuditLog(data: {
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  metadata?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId,
        metadata: data.metadata,
      },
    });
  } catch (error) {
    logger.error('Failed to create manual audit log', error);
  }
}

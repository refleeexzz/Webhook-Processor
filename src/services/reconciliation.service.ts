import { prisma } from '../config/database';

/**
 * Service de Reconciliação
 *
 * Em fintech, reconciliação é o processo de verificar que todas as transações
 * foram processadas corretamente e que os registros internos batem com os externos.
 *
 * Este service demonstra conceitos de:
 * - Auditoria de transações
 * - Detecção de inconsistências
 * - Rastreabilidade completa
 */
export class ReconciliationService {
  /**
   * Verifica integridade de eventos e deliveries
   * Detecta:
   * - Eventos sem deliveries (quando deveriam ter)
   * - Deliveries órfãs
   * - Inconsistências de status
   */
  async checkIntegrity() {
    const [
      eventsWithoutDeliveries,
      failedDeliveries,
      deadLetterCount,
      orphanedDeliveries,
    ] = await Promise.all([
      // Eventos que têm webhooks ativos mas não geraram deliveries
      prisma.$queryRaw`
        SELECT e.id, e.type, e.created_at
        FROM events e
        WHERE EXISTS (
          SELECT 1 FROM webhooks w
          WHERE w.is_active = true
          AND e.type = ANY(w.event_types)
        )
        AND NOT EXISTS (
          SELECT 1 FROM webhook_deliveries wd
          WHERE wd.event_id = e.id
        )
        LIMIT 100
      `,

      // Deliveries que falharam recentemente
      prisma.webhookDelivery.findMany({
        where: {
          status: 'FAILED',
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // últimas 24h
          },
        },
        include: {
          event: true,
          webhook: true,
        },
        take: 50,
      }),

      // Count de dead letters
      prisma.webhookDelivery.count({
        where: { status: 'DEAD_LETTER' },
      }),

      // Deliveries órfãs (webhook deletado)
      prisma.$queryRaw`
        SELECT wd.id, wd.webhook_id, wd.status
        FROM webhook_deliveries wd
        LEFT JOIN webhooks w ON w.id = wd.webhook_id
        WHERE w.id IS NULL
        LIMIT 10
      `,
    ]);

    return {
      eventsWithoutDeliveries,
      failedDeliveries,
      deadLetterCount,
      orphanedDeliveries,
      summary: {
        hasIssues:
          (eventsWithoutDeliveries as any[]).length > 0 ||
          failedDeliveries.length > 0 ||
          deadLetterCount > 0 ||
          (orphanedDeliveries as any[]).length > 0,
      },
    };
  }

  /**
   * Gera relatório de audit trail para um evento específico
   * Mostra toda a história de processamento
   */
  async getAuditTrail(eventId: string) {
    const [event, deliveries, auditLogs] = await Promise.all([
      prisma.event.findUnique({
        where: { id: eventId },
      }),

      prisma.webhookDelivery.findMany({
        where: { eventId },
        include: { webhook: true },
        orderBy: { createdAt: 'asc' },
      }),

      prisma.auditLog.findMany({
        where: {
          entityType: 'event',
          entityId: eventId,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    if (!event) {
      return null;
    }

    // Timeline completa
    const timeline = [
      {
        timestamp: event.createdAt,
        action: 'event.created',
        details: { type: event.type },
      },
      ...deliveries.map((d) => ({
        timestamp: d.createdAt,
        action: 'delivery.created',
        details: {
          webhookUrl: d.webhook.url,
          status: d.status,
        },
      })),
      ...deliveries
        .filter((d) => d.lastAttemptAt)
        .map((d) => ({
          timestamp: d.lastAttemptAt!,
          action: 'delivery.attempted',
          details: {
            webhookUrl: d.webhook.url,
            status: d.status,
            attempts: d.attempts,
            responseStatus: d.responseStatus,
          },
        })),
      ...auditLogs.map((log) => ({
        timestamp: log.createdAt,
        action: log.action,
        details: log.metadata,
      })),
    ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      event,
      deliveries,
      timeline,
      summary: {
        totalDeliveries: deliveries.length,
        successful: deliveries.filter((d) => d.status === 'SUCCESS').length,
        failed: deliveries.filter((d) => d.status === 'FAILED').length,
        deadLetter: deliveries.filter((d) => d.status === 'DEAD_LETTER').length,
      },
    };
  }

  /**
   * Calcula métricas de SLA (Service Level Agreement)
   * Importante para fintech: uptime, latência, taxa de sucesso
   */
  async calculateSLA(startDate: Date, endDate: Date) {
    const [deliveryStats, avgProcessingTime] = await Promise.all([
      prisma.webhookDelivery.groupBy({
        by: ['status'],
        _count: { status: true },
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      prisma.$queryRaw<Array<{ avg_seconds: number }>>`
        SELECT AVG(EXTRACT(EPOCH FROM (last_attempt_at - created_at))) as avg_seconds
        FROM webhook_deliveries
        WHERE status = 'SUCCESS'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      `,
    ]);

    const total = deliveryStats.reduce((sum, stat) => sum + stat._count.status, 0);
    const successful = deliveryStats.find((s) => s.status === 'SUCCESS')?._count.status || 0;

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      metrics: {
        totalDeliveries: total,
        successRate: total > 0 ? ((successful / total) * 100).toFixed(2) + '%' : '0%',
        avgProcessingTimeSeconds: avgProcessingTime[0]?.avg_seconds || 0,
        deliveryStats: deliveryStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }
}

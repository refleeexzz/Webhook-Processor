import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { DeliveryStatus } from '@prisma/client';

export class MetricsController {
  async getMetrics(req: Request, res: Response) {
    try {
      const [
        totalEvents,
        totalWebhooks,
        activeWebhooks,
        deliveryStats,
      ] = await Promise.all([
        // Total de eventos
        prisma.event.count(),

        // Total de webhooks
        prisma.webhook.count(),

        // Webhooks ativos
        prisma.webhook.count({
          where: { isActive: true },
        }),

        // Status de deliveries
        prisma.webhookDelivery.groupBy({
          by: ['status'],
          _count: {
            status: true,
          },
        }),
      ]);

      // Calcular taxa de sucesso
      const successCount = deliveryStats.find(
        (s) => s.status === DeliveryStatus.SUCCESS
      )?._count.status || 0;

      const failedCount = deliveryStats.find(
        (s) => s.status === DeliveryStatus.FAILED
      )?._count.status || 0;

      const deadLetterCount = deliveryStats.find(
        (s) => s.status === DeliveryStatus.DEAD_LETTER
      )?._count.status || 0;

      const totalDeliveries = deliveryStats.reduce(
        (sum, stat) => sum + stat._count.status,
        0
      );

      const successRate = totalDeliveries > 0
        ? ((successCount / totalDeliveries) * 100).toFixed(2)
        : '0.00';

      return res.json({
        success: true,
        data: {
          events: {
            total: totalEvents,
          },
          webhooks: {
            total: totalWebhooks,
            active: activeWebhooks,
          },
          deliveries: {
            total: totalDeliveries,
            byStatus: {
              success: successCount,
              failed: failedCount,
              deadLetter: deadLetterCount,
              pending: deliveryStats.find(s => s.status === DeliveryStatus.PENDING)?._count.status || 0,
              processing: deliveryStats.find(s => s.status === DeliveryStatus.PROCESSING)?._count.status || 0,
            },
            successRate: `${successRate}%`,
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch metrics',
      });
    }
  }
}

import { DeliveryStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { signPayload } from '../utils/crypto';
import { getNextRetryDate } from '../utils/retry';
import { env } from '../config/env';

export class DeliveryService {
  async createDelivery(eventId: string, webhookId: string) {
    return prisma.webhookDelivery.create({
      data: {
        eventId,
        webhookId,
        status: DeliveryStatus.PENDING,
      },
    });
  }

  async attemptDelivery(deliveryId: string): Promise<boolean> {
    const delivery = await prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: {
        event: true,
        webhook: true,
      },
    });

    if (!delivery) {
      throw new Error('Delivery not found');
    }

    const { event, webhook } = delivery;

    // Preparar payload
    const payload = JSON.stringify({
      id: event.id,
      type: event.type,
      data: event.payload,
      timestamp: event.createdAt.toISOString(),
    });

    // Assinar payload
    const signature = signPayload(payload, webhook.secret);

    try {
      // update status to PROCESSING
      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.PROCESSING,
          attempts: delivery.attempts + 1,
          lastAttemptAt: new Date(),
        },
      });

      // make http request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), env.WEBHOOK_TIMEOUT_MS);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Id': delivery.id,
        },
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseBody = await response.text().catch(() => null);

      // Sucesso (2xx)
      if (response.ok) {
        await prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: {
            status: DeliveryStatus.SUCCESS,
            responseStatus: response.status,
            responseBody: responseBody?.substring(0, 1000),
          },
        });
        return true;
      }

      // Falha
      throw new Error(`HTTP ${response.status}: ${responseBody}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const newAttempts = delivery.attempts + 1;

      // Se excedeu o max attempts, move to dead letter
      if (newAttempts >= env.MAX_RETRY_ATTEMPTS) {
        await prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: {
            status: DeliveryStatus.DEAD_LETTER,
            errorMessage: errorMessage.substring(0, 1000),
          },
        });
        return false;
      }

      // Agendar retry
      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.FAILED,
          errorMessage: errorMessage.substring(0, 1000),
          nextRetryAt: getNextRetryDate(newAttempts),
        },
      });

      return false;
    }
  }

  async getDelivery(id: string) {
    return prisma.webhookDelivery.findUnique({
      where: { id },
      include: {
        event: true,
        webhook: true,
      },
    });
  }

  async listDeliveriesByStatus(status: DeliveryStatus) {
    return prisma.webhookDelivery.findMany({
      where: { status },
      include: {
        event: true,
        webhook: true,
      },
    });
  }
}

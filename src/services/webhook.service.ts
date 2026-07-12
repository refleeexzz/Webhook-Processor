import { prisma } from '../config/database';
import { generateWebhookSecret } from '../utils/crypto';
import { CreateWebhookInput, UpdateWebhookInput } from '../schemas';

export class WebhookService {
  async createWebhook(data: CreateWebhookInput) {
    const secret = generateWebhookSecret();

    return prisma.webhook.create({
      data: {
        url: data.url,
        secret,
        eventTypes: data.eventTypes,
      },
    });
  }

  async getWebhook(id: string) {
    return prisma.webhook.findUnique({
      where: { id },
      include: {
        deliveries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async listWebhooks() {
    return prisma.webhook.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateWebhook(id: string, data: UpdateWebhookInput) {
    return prisma.webhook.update({
      where: { id },
      data,
    });
  }

  async deleteWebhook(id: string) {
    return prisma.webhook.delete({
      where: { id },
    });
  }

  async getActiveWebhooksForEvent(eventType: string) {
    return prisma.webhook.findMany({
      where: {
        isActive: true,
        eventTypes: {
          has: eventType,
        },
      },
    });
  }
}

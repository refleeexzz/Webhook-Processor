import { WebhookService } from '../../services/webhook.service';
import { prisma } from '../../config/database';

jest.mock('../../config/database', () => ({
  prisma: {
    webhook: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('../../utils/crypto', () => ({
  generateWebhookSecret: jest.fn(() => 'generated-secret-123'),
}));

describe('WebhookService', () => {
  let webhookService: WebhookService;

  beforeEach(() => {
    webhookService = new WebhookService();
    jest.clearAllMocks();
  });

  describe('createWebhook', () => {
    it('should create a webhook with generated secret', async () => {
      const mockWebhook = {
        id: 'webhook-123',
        url: 'https://example.com/webhook',
        secret: 'generated-secret-123',
        eventTypes: ['test.event'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.webhook.create as jest.Mock).mockResolvedValue(mockWebhook);

      const result = await webhookService.createWebhook({
        url: 'https://example.com/webhook',
        eventTypes: ['test.event'],
      });

      expect(result).toEqual(mockWebhook);
      expect(prisma.webhook.create).toHaveBeenCalledWith({
        data: {
          url: 'https://example.com/webhook',
          secret: 'generated-secret-123',
          eventTypes: ['test.event'],
        },
      });
    });
  });

  describe('getActiveWebhooksForEvent', () => {
    it('should return webhooks subscribed to event type', async () => {
      const mockWebhooks = [
        {
          id: 'webhook-1',
          url: 'https://example.com/webhook',
          eventTypes: ['test.event', 'user.created'],
          isActive: true,
        },
      ];

      (prisma.webhook.findMany as jest.Mock).mockResolvedValue(mockWebhooks);

      const result = await webhookService.getActiveWebhooksForEvent('test.event');

      expect(result).toEqual(mockWebhooks);
      expect(prisma.webhook.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          eventTypes: {
            has: 'test.event',
          },
        },
      });
    });
  });

  describe('updateWebhook', () => {
    it('should update webhook properties', async () => {
      const mockWebhook = {
        id: 'webhook-123',
        isActive: false,
      };

      (prisma.webhook.update as jest.Mock).mockResolvedValue(mockWebhook);

      const result = await webhookService.updateWebhook('webhook-123', {
        isActive: false,
      });

      expect(result).toEqual(mockWebhook);
    });
  });
});

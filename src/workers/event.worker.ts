import { Worker, Job } from 'bullmq';
import { queueConnection } from '../config/queue';
import { prisma } from '../config/database';
import { webhookDeliveryQueue } from '../config/queue';
import { WebhookService } from '../services/webhook.service';
import { DeliveryService } from '../services/delivery.service';
import { logger } from '../utils/logger';

const webhookService = new WebhookService();
const deliveryService = new DeliveryService();

export const eventWorker = new Worker(
  'events',
  async (job: Job) => {
    const { eventId } = job.data;

    logger.info('Processing event', { eventId, jobId: job.id });

    // fetch the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    // fetch active webhooks for this event type
    const webhooks = await webhookService.getActiveWebhooksForEvent(event.type);

    logger.debug('Found webhooks for event', {
      eventId,
      eventType: event.type,
      webhookCount: webhooks.length,
    });

    // create deliveries for each webhook
    const deliveries = await Promise.all(
      webhooks.map(async (webhook) => {
        const delivery = await deliveryService.createDelivery(event.id, webhook.id);

        // add to delivery queue
        await webhookDeliveryQueue.add('deliver-webhook', {
          deliveryId: delivery.id,
        });

        return delivery;
      })
    );

    return { eventId, deliveriesCreated: deliveries.length };
  },
  {
    connection: queueConnection,
    concurrency: 5,
  }
);

eventWorker.on('completed', (job) => {
  logger.info('Event job completed', {
    jobId: job.id,
    result: job.returnvalue,
  });
});

eventWorker.on('failed', (job, err) => {
  logger.error('Event job failed', err, { jobId: job?.id });
});

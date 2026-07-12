import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/queue';
import { prisma } from '../config/database';
import { webhookDeliveryQueue } from '../config/queue';
import { WebhookService } from '../services/webhook.service';
import { DeliveryService } from '../services/delivery.service';

const webhookService = new WebhookService();
const deliveryService = new DeliveryService();

export const eventWorker = new Worker(
  'events',
  async (job: Job) => {
    const { eventId } = job.data;

    console.log(`[Event Worker] Processing event ${eventId}`);

    // Buscar o evento
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    // Buscar webhooks ativos para esse tipo de evento
    const webhooks = await webhookService.getActiveWebhooksForEvent(event.type);

    console.log(`[Event Worker] Found ${webhooks.length} webhooks for event type "${event.type}"`);

    // Criar deliveries para cada webhook
    const deliveries = await Promise.all(
      webhooks.map(async (webhook) => {
        const delivery = await deliveryService.createDelivery(event.id, webhook.id);

        // Adicionar à fila de entrega
        await webhookDeliveryQueue.add('deliver-webhook', {
          deliveryId: delivery.id,
        });

        return delivery;
      })
    );

    return { eventId, deliveriesCreated: deliveries.length };
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

eventWorker.on('completed', (job) => {
  console.log(`[Event Worker] Job ${job.id} completed:`, job.returnvalue);
});

eventWorker.on('failed', (job, err) => {
  console.error(`[Event Worker] Job ${job?.id} failed:`, err.message);
});

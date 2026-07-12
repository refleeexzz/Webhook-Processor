import { Worker, Job } from 'bullmq';
import { redisConnection, webhookDeliveryQueue } from '../config/queue';
import { DeliveryService } from '../services/delivery.service';
import { env } from '../config/env';

const deliveryService = new DeliveryService();

export const webhookDeliveryWorker = new Worker(
  'webhook-deliveries',
  async (job: Job) => {
    const { deliveryId } = job.data;

    console.log(`[Delivery Worker] Attempting delivery ${deliveryId}`);

    const success = await deliveryService.attemptDelivery(deliveryId);

    if (!success) {
      const delivery = await deliveryService.getDelivery(deliveryId);

      // Se não atingiu o limite, reagendar
      if (delivery && delivery.status === 'FAILED' && delivery.nextRetryAt) {
        const delay = delivery.nextRetryAt.getTime() - Date.now();

        await webhookDeliveryQueue.add(
          'deliver-webhook',
          { deliveryId },
          { delay: Math.max(0, delay) }
        );

        console.log(`[Delivery Worker] Delivery ${deliveryId} rescheduled for retry in ${delay}ms`);
      } else if (delivery && delivery.status === 'DEAD_LETTER') {
        console.error(`[Delivery Worker] Delivery ${deliveryId} moved to dead letter queue`);
      }
    }

    return { deliveryId, success };
  },
  {
    connection: redisConnection,
    concurrency: env.WORKER_CONCURRENCY,
  }
);

webhookDeliveryWorker.on('completed', (job) => {
  console.log(`[Delivery Worker] Job ${job.id} completed:`, job.returnvalue);
});

webhookDeliveryWorker.on('failed', (job, err) => {
  console.error(`[Delivery Worker] Job ${job?.id} failed:`, err.message);
});

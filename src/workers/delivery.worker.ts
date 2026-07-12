import { Worker, Job } from 'bullmq';
import { redisConnection, webhookDeliveryQueue } from '../config/queue';
import { DeliveryService } from '../services/delivery.service';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const deliveryService = new DeliveryService();

export const webhookDeliveryWorker = new Worker(
  'webhook-deliveries',
  async (job: Job) => {
    const { deliveryId } = job.data;

    logger.info('Attempting webhook delivery', { deliveryId, jobId: job.id });

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

        logger.warn('Delivery rescheduled for retry', {
          deliveryId,
          delayMs: delay,
          attempt: delivery.attempts,
        });
      } else if (delivery && delivery.status === 'DEAD_LETTER') {
        logger.error('Delivery moved to dead letter queue', null, {
          deliveryId,
          attempts: delivery.attempts,
        });
      }
    } else {
      logger.info('Delivery successful', { deliveryId });
    }

    return { deliveryId, success };
  },
  {
    connection: redisConnection,
    concurrency: env.WORKER_CONCURRENCY,
  }
);

webhookDeliveryWorker.on('completed', (job) => {
  logger.debug('Delivery job completed', { jobId: job.id, result: job.returnvalue });
});

webhookDeliveryWorker.on('failed', (job, err) => {
  logger.error('Delivery job failed', err, { jobId: job?.id });
});

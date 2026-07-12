import './event.worker';
import './delivery.worker';
import { logger } from '../utils/logger';

logger.info('Workers started successfully', {
  workers: ['event-worker', 'delivery-worker'],
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down workers...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down workers...');
  process.exit(0);
});

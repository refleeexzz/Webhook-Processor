import { Router } from 'express';
import eventRoutes from './event.routes';
import webhookRoutes from './webhook.routes';
import metricsRoutes from './metrics.routes';

const router = Router();

router.use('/events', eventRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/metrics', metricsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

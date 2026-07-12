import { Router } from 'express';
import eventRoutes from './event.routes';
import webhookRoutes from './webhook.routes';
import metricsRoutes from './metrics.routes';
import reconciliationRoutes from './reconciliation.routes';

const router = Router();

router.use('/events', eventRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/metrics', metricsRoutes);
router.use('/reconciliation', reconciliationRoutes);

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System is healthy
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import { webhookRateLimiter } from '../middlewares/rateLimiter';
import { auditLogger } from '../middlewares/audit';

const router = Router();
const webhookController = new WebhookController();

/**
 * @openapi
 * /api/webhooks:
 *   post:
 *     summary: Create a new webhook
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url, eventTypes]
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: https://your-app.com/webhook
 *               eventTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user.created", "user.updated"]
 *     responses:
 *       201:
 *         description: Webhook created successfully
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  '/',
  webhookRateLimiter,
  auditLogger({ entityType: 'webhook', action: 'create' }),
  (req, res) => webhookController.create(req, res)
);

/**
 * @openapi
 * /api/webhooks:
 *   get:
 *     summary: List all webhooks
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: List of webhooks
 */
router.get('/', (req, res) => webhookController.list(req, res));

/**
 * @openapi
 * /api/webhooks/{id}:
 *   get:
 *     summary: Get webhook by ID
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook details
 *       404:
 *         description: Webhook not found
 */
router.get('/:id', (req, res) => webhookController.get(req, res));

/**
 * @openapi
 * /api/webhooks/{id}:
 *   patch:
 *     summary: Update webhook
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               eventTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Webhook updated
 */
router.patch(
  '/:id',
  webhookRateLimiter,
  auditLogger({ entityType: 'webhook', action: 'update' }),
  (req, res) => webhookController.update(req, res)
);

/**
 * @openapi
 * /api/webhooks/{id}:
 *   delete:
 *     summary: Delete webhook
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Webhook deleted
 */
router.delete(
  '/:id',
  auditLogger({ entityType: 'webhook', action: 'delete' }),
  (req, res) => webhookController.delete(req, res)
);

export default router;

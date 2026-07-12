import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { createEventRateLimiter } from '../middlewares/rateLimiter';
import { idempotencyMiddleware } from '../middlewares/idempotency';
import { auditLogger } from '../middlewares/audit';

const router = Router();
const eventController = new EventController();

/**
 * @openapi
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/IdempotencyKey'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, payload]
 *             properties:
 *               type:
 *                 type: string
 *                 example: user.created
 *               payload:
 *                 type: object
 *                 example: { userId: "123", email: "user@example.com" }
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  '/',
  createEventRateLimiter,
  idempotencyMiddleware,
  auditLogger({ entityType: 'event', action: 'create' }),
  (req, res) => eventController.create(req, res)
);

/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: List all events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of events
 */
router.get('/', (req, res) => eventController.list(req, res));

/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get('/:id', (req, res) => eventController.get(req, res));

export default router;

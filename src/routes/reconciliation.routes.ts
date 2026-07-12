import { Router } from 'express';
import { ReconciliationController } from '../controllers/reconciliation.controller';

const router = Router();
const reconciliationController = new ReconciliationController();

/**
 * @openapi
 * /api/reconciliation/integrity:
 *   get:
 *     summary: Check system integrity
 *     description: Verifies data consistency and detects anomalies
 *     tags: [Reconciliation]
 *     responses:
 *       200:
 *         description: Integrity report
 */
router.get('/integrity', (req, res) => reconciliationController.checkIntegrity(req, res));

/**
 * @openapi
 * /api/reconciliation/audit-trail/{eventId}:
 *   get:
 *     summary: Get complete audit trail for an event
 *     description: Returns full processing history with timeline
 *     tags: [Reconciliation]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit trail
 *       404:
 *         description: Event not found
 */
router.get('/audit-trail/:eventId', (req, res) =>
  reconciliationController.getAuditTrail(req, res)
);

/**
 * @openapi
 * /api/reconciliation/sla:
 *   get:
 *     summary: Calculate SLA metrics
 *     description: Service Level Agreement metrics for a time period
 *     tags: [Reconciliation]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: SLA metrics
 */
router.get('/sla', (req, res) => reconciliationController.calculateSLA(req, res));

export default router;

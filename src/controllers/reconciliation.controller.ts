import { Request, Response } from 'express';
import { ReconciliationService } from '../services/reconciliation.service';

const reconciliationService = new ReconciliationService();

export class ReconciliationController {
  async checkIntegrity(req: Request, res: Response) {
    try {
      const result = await reconciliationService.checkIntegrity();

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to check integrity',
      });
    }
  }

  async getAuditTrail(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const trail = await reconciliationService.getAuditTrail(eventId);

      if (!trail) {
        return res.status(404).json({
          success: false,
          error: 'Event not found',
        });
      }

      return res.json({
        success: true,
        data: trail,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get audit trail',
      });
    }
  }

  async calculateSLA(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate
        ? new Date(startDate as string)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 dias atrás

      const end = endDate ? new Date(endDate as string) : new Date();

      const sla = await reconciliationService.calculateSLA(start, end);

      return res.json({
        success: true,
        data: sla,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to calculate SLA',
      });
    }
  }
}

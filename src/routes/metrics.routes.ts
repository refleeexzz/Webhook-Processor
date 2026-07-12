import { Router } from 'express';
import { MetricsController } from '../controllers/metrics.controller';

const router = Router();
const metricsController = new MetricsController();

router.get('/', (req, res) => metricsController.getMetrics(req, res));

export default router;

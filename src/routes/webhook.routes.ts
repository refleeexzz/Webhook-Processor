import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();
const webhookController = new WebhookController();

router.post('/', (req, res) => webhookController.create(req, res));
router.get('/', (req, res) => webhookController.list(req, res));
router.get('/:id', (req, res) => webhookController.get(req, res));
router.patch('/:id', (req, res) => webhookController.update(req, res));
router.delete('/:id', (req, res) => webhookController.delete(req, res));

export default router;

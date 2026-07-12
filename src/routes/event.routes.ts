import { Router } from 'express';
import { EventController } from '../controllers/event.controller';

const router = Router();
const eventController = new EventController();

router.post('/', (req, res) => eventController.create(req, res));
router.get('/', (req, res) => eventController.list(req, res));
router.get('/:id', (req, res) => eventController.get(req, res));

export default router;

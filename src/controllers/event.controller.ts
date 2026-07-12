import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { createEventSchema } from '../schemas';

const eventService = new EventService();

export class EventController {
  async create(req: Request, res: Response) {
    try {
      const data = createEventSchema.parse(req.body);
      const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

      const event = await eventService.createEvent(data, idempotencyKey);

      return res.status(201).json({
        success: true,
        data: event,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await eventService.getEvent(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found',
        });
      }

      return res.json({
        success: true,
        data: event,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await eventService.listEvents(page, limit);

      return res.json({
        success: true,
        data: result.events,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
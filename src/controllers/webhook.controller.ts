import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';
import { createWebhookSchema, updateWebhookSchema } from '../schemas';

const webhookService = new WebhookService();

export class WebhookController {
  async create(req: Request, res: Response) {
    try {
      const data = createWebhookSchema.parse(req.body);
      const webhook = await webhookService.createWebhook(data);

      return res.status(201).json({
        success: true,
        data: webhook,
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
      const webhook = await webhookService.getWebhook(id);

      if (!webhook) {
        return res.status(404).json({
          success: false,
          error: 'Webhook not found',
        });
      }

      return res.json({
        success: true,
        data: webhook,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async list(_req: Request, res: Response) {
    try {
      const webhooks = await webhookService.listWebhooks();

      return res.json({
        success: true,
        data: webhooks,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateWebhookSchema.parse(req.body);

      const webhook = await webhookService.updateWebhook(id, data);

      return res.json({
        success: true,
        data: webhook,
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

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await webhookService.deleteWebhook(id);

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
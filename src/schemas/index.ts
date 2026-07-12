import { z } from 'zod';

export const createEventSchema = z.object({
  type: z.string().min(1).max(100),
  payload: z.record(z.any()),
});

export const createWebhookSchema = z.object({
  url: z.string().url(),
  eventTypes: z.array(z.string()).min(1),
});

export const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  eventTypes: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;

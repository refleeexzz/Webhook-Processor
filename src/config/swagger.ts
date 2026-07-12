import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Webhook Processor API',
      version: '1.0.0',
      description: 'Distributed webhook processing system with retry logic and idempotency',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        Event: {
          type: 'object',
          required: ['type', 'payload'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Event unique identifier',
            },
            type: {
              type: 'string',
              description: 'Event type (e.g., user.created, order.completed)',
              example: 'user.created',
            },
            payload: {
              type: 'object',
              description: 'Event data payload',
              example: { userId: '123', email: 'user@example.com' },
            },
            idempotencyKey: {
              type: 'string',
              format: 'uuid',
              description: 'Optional idempotency key to prevent duplicate processing',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Webhook: {
          type: 'object',
          required: ['url', 'eventTypes'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'Webhook destination URL',
              example: 'https://your-app.com/webhook',
            },
            secret: {
              type: 'string',
              description: 'HMAC secret for signature verification',
            },
            eventTypes: {
              type: 'array',
              items: { type: 'string' },
              description: 'Event types this webhook subscribes to',
              example: ['user.created', 'user.updated'],
            },
            isActive: {
              type: 'boolean',
              description: 'Whether webhook is active',
              default: true,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
      parameters: {
        IdempotencyKey: {
          in: 'header',
          name: 'Idempotency-Key',
          schema: {
            type: 'string',
            format: 'uuid',
          },
          required: false,
          description: 'UUID for idempotent requests (prevents duplicate processing)',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

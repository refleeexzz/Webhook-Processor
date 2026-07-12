import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import { apiRateLimiter } from './middlewares/rateLimiter';
import { logger } from './utils/logger';

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production' ? ['https://your-domain.com'] : '*',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api', apiRateLimiter);

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Webhook Processor API',
}));

// Routes
app.use('/api', routes);

// Root redirect
app.get('/', (_req, res) => {
  res.json({
    name: 'Webhook Processor API',
    version: '1.0.0',
    documentation: '/docs',
    health: '/api/health',
    metrics: '/api/metrics',
  });
});

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  logger.info('Server started', {
    port: env.PORT,
    environment: env.NODE_ENV,
    docs: `http://localhost:${env.PORT}/docs`,
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

import express from 'express';
import { env } from './config/env';
import routes from './routes';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`[Server] Running on port ${env.PORT}`);
  console.log(`[Server] Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[Server] Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[Server] Shutting down gracefully...');
  process.exit(0);
});

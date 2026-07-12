import './event.worker';
import './delivery.worker';

console.log('[Workers] All workers started successfully');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[Workers] Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[Workers] Shutting down gracefully...');
  process.exit(0);
});

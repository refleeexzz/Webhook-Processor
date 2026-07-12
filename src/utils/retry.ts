export function calculateBackoff(attempt: number): number {
  // Backoff exponencial: 1s, 2s, 4s, 8s, 16s, etc.
  const baseDelay = 1000; // 1 segundo
  return Math.min(baseDelay * Math.pow(2, attempt), 60000); // max 1 minute
}

export function getNextRetryDate(attempt: number): Date {
  const delay = calculateBackoff(attempt);
  return new Date(Date.now() + delay);
}

import { calculateBackoff, getNextRetryDate } from '../../utils/retry';

describe('Retry Utils', () => {
  describe('calculateBackoff', () => {
    it('should calculate exponential backoff correctly', () => {
      expect(calculateBackoff(0)).toBe(1000);  // 1s
      expect(calculateBackoff(1)).toBe(2000);  // 2s
      expect(calculateBackoff(2)).toBe(4000);  // 4s
      expect(calculateBackoff(3)).toBe(8000);  // 8s
      expect(calculateBackoff(4)).toBe(16000); // 16s
    });

    it('should cap backoff at 60 seconds', () => {
      expect(calculateBackoff(10)).toBe(60000);
      expect(calculateBackoff(20)).toBe(60000);
    });
  });

  describe('getNextRetryDate', () => {
    it('should return a future date', () => {
      const now = Date.now();
      const nextRetry = getNextRetryDate(0);

      expect(nextRetry.getTime()).toBeGreaterThan(now);
    });

    it('should increase delay with each attempt', () => {
      const retry1 = getNextRetryDate(0).getTime();
      const retry2 = getNextRetryDate(1).getTime();

      const delay1 = retry1 - Date.now();
      const delay2 = retry2 - Date.now();

      expect(delay2).toBeGreaterThan(delay1);
    });
  });
});

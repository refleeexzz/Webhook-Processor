import { signPayload, verifySignature, generateWebhookSecret } from '../../utils/crypto';

describe('Crypto Utils', () => {
  describe('generateWebhookSecret', () => {
    it('should generate a 64-character hex string', () => {
      const secret = generateWebhookSecret();
      expect(secret).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(secret)).toBe(true);
    });

    it('should generate unique secrets', () => {
      const secret1 = generateWebhookSecret();
      const secret2 = generateWebhookSecret();
      expect(secret1).not.toBe(secret2);
    });
  });

  describe('signPayload', () => {
    it('should generate consistent signatures for same input', () => {
      const payload = 'test payload';
      const secret = 'test-secret';

      const signature1 = signPayload(payload, secret);
      const signature2 = signPayload(payload, secret);

      expect(signature1).toBe(signature2);
    });

    it('should generate different signatures for different payloads', () => {
      const secret = 'test-secret';
      const signature1 = signPayload('payload1', secret);
      const signature2 = signPayload('payload2', secret);

      expect(signature1).not.toBe(signature2);
    });

    it('should generate different signatures for different secrets', () => {
      const payload = 'test payload';
      const signature1 = signPayload(payload, 'secret1');
      const signature2 = signPayload(payload, 'secret2');

      expect(signature1).not.toBe(signature2);
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signatures', () => {
      const payload = 'test payload';
      const secret = 'test-secret';
      const signature = signPayload(payload, secret);

      expect(verifySignature(payload, signature, secret)).toBe(true);
    });

    it('should reject invalid signatures', () => {
      const payload = 'test payload';
      const secret = 'test-secret';
      const wrongSignature = 'invalid-signature';

      expect(verifySignature(payload, wrongSignature, secret)).toBe(false);
    });
  });
});

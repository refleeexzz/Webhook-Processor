export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const ENDPOINTS = {
  health: '/health',
  metrics: '/metrics',
  events: '/events',
  webhooks: '/webhooks',
  reconciliation: {
    integrity: '/reconciliation/integrity',
    sla: '/reconciliation/sla',
    auditTrail: (eventId: string) => `/reconciliation/audit-trail/${eventId}`,
  },
};

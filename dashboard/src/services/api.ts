import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Event {
  id: string;
  type: string;
  payload: any;
  idempotencyKey?: string;
  createdAt: string;
}

export interface Webhook {
  id: string;
  url: string;
  secret: string;
  eventTypes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Metrics {
  events: { total: number };
  webhooks: { total: number; active: number };
  deliveries: {
    total: number;
    byStatus: {
      success: number;
      failed: number;
      deadLetter: number;
      pending: number;
      processing: number;
    };
    successRate: string;
  };
  timestamp: string;
}

export interface SLAMetrics {
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalDeliveries: number;
    successRate: string;
    avgProcessingTimeSeconds: number;
    deliveryStats: Record<string, number>;
  };
}

// API calls
export const healthCheck = () => api.get('/health');

export const getMetrics = () => api.get<{ success: boolean; data: Metrics }>('/metrics');

export const getEvents = (page = 1, limit = 20) =>
  api.get(`/events?page=${page}&limit=${limit}`);

export const getEvent = (id: string) => api.get(`/events/${id}`);

export const createEvent = (data: { type: string; payload: any }, idempotencyKey?: string) =>
  api.post('/events', data, {
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
  });

export const getWebhooks = () =>
  api.get<{ success: boolean; data: Webhook[] }>('/webhooks');

export const createWebhook = (data: { url: string; eventTypes: string[] }) =>
  api.post('/webhooks', data);

export const updateWebhook = (id: string, data: Partial<Webhook>) =>
  api.patch(`/webhooks/${id}`, data);

export const deleteWebhook = (id: string) => api.delete(`/webhooks/${id}`);

export const checkIntegrity = () => api.get('/reconciliation/integrity');

export const getSLA = (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return api.get<{ success: boolean; data: SLAMetrics }>(
    `/reconciliation/sla?${params.toString()}`
  );
};

export const getAuditTrail = (eventId: string) =>
  api.get(`/reconciliation/audit-trail/${eventId}`);

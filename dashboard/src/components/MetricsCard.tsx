import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMetrics } from '../services/api';
import { Activity, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

export const MetricsCard: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics'],
    queryFn: getMetrics,
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });

  if (isLoading) {
    return (
      <div className="metrics-loading">
        <div className="spinner"></div>
        <p>Loading metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="metrics-error">
        <AlertTriangle size={24} />
        <p>Failed to load metrics</p>
      </div>
    );
  }

  const metrics = data.data.data;

  return (
    <div className="metrics-container">
      <h2>System Metrics</h2>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <Activity size={20} />
            <span>Events</span>
          </div>
          <div className="metric-value">{metrics.events.total}</div>
          <div className="metric-label">Total Events</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Activity size={20} />
            <span>Webhooks</span>
          </div>
          <div className="metric-value">{metrics.webhooks.active}</div>
          <div className="metric-label">
            {metrics.webhooks.active} active / {metrics.webhooks.total} total
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-header">
            <CheckCircle size={20} />
            <span>Success</span>
          </div>
          <div className="metric-value">{metrics.deliveries.byStatus.success}</div>
          <div className="metric-label">Successful Deliveries</div>
        </div>

        <div className="metric-card warning">
          <div className="metric-header">
            <Clock size={20} />
            <span>Pending</span>
          </div>
          <div className="metric-value">
            {metrics.deliveries.byStatus.pending + metrics.deliveries.byStatus.processing}
          </div>
          <div className="metric-label">In Progress</div>
        </div>

        <div className="metric-card error">
          <div className="metric-header">
            <XCircle size={20} />
            <span>Failed</span>
          </div>
          <div className="metric-value">{metrics.deliveries.byStatus.failed}</div>
          <div className="metric-label">Failed Deliveries</div>
        </div>

        <div className="metric-card critical">
          <div className="metric-header">
            <AlertTriangle size={20} />
            <span>Dead Letter</span>
          </div>
          <div className="metric-value">{metrics.deliveries.byStatus.deadLetter}</div>
          <div className="metric-label">Requires Attention</div>
        </div>
      </div>

      <div className="success-rate">
        <h3>Success Rate</h3>
        <div className="success-rate-value">{metrics.deliveries.successRate}</div>
        <div className="success-rate-bar">
          <div
            className="success-rate-fill"
            style={{ width: metrics.deliveries.successRate }}
          ></div>
        </div>
      </div>

      <div className="metrics-footer">
        <small>Last updated: {new Date(metrics.timestamp).toLocaleString()}</small>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSLA } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Target } from 'lucide-react';

export const SLAMetrics: React.FC = () => {
  const [days, setDays] = useState(7);

  const { data, isLoading } = useQuery({
    queryKey: ['sla', days],
    queryFn: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      return getSLA(startDate.toISOString(), endDate.toISOString());
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <div className="loading">Loading SLA metrics...</div>;
  }

  const sla = data?.data.data;

  if (!sla) {
    return <div>No SLA data available</div>;
  }

  // Preparar dados para o gráfico
  const chartData = Object.entries(sla.metrics.deliveryStats).map(([status, count]) => ({
    status,
    count,
  }));

  return (
    <div className="sla-container">
      <div className="sla-header">
        <h2>SLA Metrics</h2>
        <div className="sla-period-selector">
          <button
            className={days === 1 ? 'active' : ''}
            onClick={() => setDays(1)}
          >
            24h
          </button>
          <button
            className={days === 7 ? 'active' : ''}
            onClick={() => setDays(7)}
          >
            7d
          </button>
          <button
            className={days === 30 ? 'active' : ''}
            onClick={() => setDays(30)}
          >
            30d
          </button>
        </div>
      </div>

      <div className="sla-metrics-grid">
        <div className="sla-metric-card">
          <div className="sla-metric-icon">
            <Target size={24} />
          </div>
          <div className="sla-metric-content">
            <div className="sla-metric-label">Success Rate</div>
            <div className="sla-metric-value">{sla.metrics.successRate}</div>
          </div>
        </div>

        <div className="sla-metric-card">
          <div className="sla-metric-icon">
            <TrendingUp size={24} />
          </div>
          <div className="sla-metric-content">
            <div className="sla-metric-label">Total Deliveries</div>
            <div className="sla-metric-value">{sla.metrics.totalDeliveries}</div>
          </div>
        </div>

        <div className="sla-metric-card">
          <div className="sla-metric-icon">
            <Clock size={24} />
          </div>
          <div className="sla-metric-content">
            <div className="sla-metric-label">Avg Processing Time</div>
            <div className="sla-metric-value">
              {sla.metrics.avgProcessingTimeSeconds.toFixed(2)}s
            </div>
          </div>
        </div>
      </div>

      <div className="sla-chart">
        <h3>Delivery Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="sla-period-info">
        <small>
          Period: {new Date(sla.period.start).toLocaleDateString()} -{' '}
          {new Date(sla.period.end).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

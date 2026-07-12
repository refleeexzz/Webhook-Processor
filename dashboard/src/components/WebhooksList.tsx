import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWebhooks, createWebhook, updateWebhook, deleteWebhook, Webhook } from '../services/api';
import { Plus, Trash2, Power, PowerOff } from 'lucide-react';

export const WebhooksList: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ url: '', eventTypes: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: getWebhooks,
    refetchInterval: 10000,
  });

  const createMutation = useMutation({
    mutationFn: createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setShowForm(false);
      setFormData({ url: '', eventTypes: '' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateWebhook(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventTypes = formData.eventTypes.split(',').map((s) => s.trim());
    createMutation.mutate({ url: formData.url, eventTypes });
  };

  if (isLoading) {
    return <div className="loading">Loading webhooks...</div>;
  }

  const webhooks = data?.data.data || [];

  return (
    <div className="webhooks-container">
      <div className="webhooks-header">
        <h2>Webhooks</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          New Webhook
        </button>
      </div>

      {showForm && (
        <form className="webhook-form" onSubmit={handleSubmit}>
          <input
            type="url"
            placeholder="https://your-app.com/webhook"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Event types (comma-separated): user.created, order.completed"
            value={formData.eventTypes}
            onChange={(e) => setFormData({ ...formData, eventTypes: e.target.value })}
            required
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="webhooks-list">
        {webhooks.length === 0 ? (
          <div className="empty-state">
            <p>No webhooks configured yet</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Create your first webhook
            </button>
          </div>
        ) : (
          webhooks.map((webhook: Webhook) => (
            <div key={webhook.id} className={`webhook-item ${webhook.isActive ? 'active' : 'inactive'}`}>
              <div className="webhook-info">
                <div className="webhook-url">{webhook.url}</div>
                <div className="webhook-events">
                  {webhook.eventTypes.map((type) => (
                    <span key={type} className="event-badge">
                      {type}
                    </span>
                  ))}
                </div>
                <div className="webhook-meta">
                  Created: {new Date(webhook.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="webhook-actions">
                <button
                  className={`btn btn-icon ${webhook.isActive ? 'btn-warning' : 'btn-success'}`}
                  onClick={() => toggleMutation.mutate({ id: webhook.id, isActive: webhook.isActive })}
                  title={webhook.isActive ? 'Deactivate' : 'Activate'}
                >
                  {webhook.isActive ? <Power size={16} /> : <PowerOff size={16} />}
                </button>
                <button
                  className="btn btn-icon btn-danger"
                  onClick={() => {
                    if (window.confirm('Delete this webhook?')) {
                      deleteMutation.mutate(webhook.id);
                    }
                  }}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

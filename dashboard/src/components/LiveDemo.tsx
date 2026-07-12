import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWebhook, createEvent } from '../services/api';
import { Play, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';

interface EventTemplate {
  name: string;
  type: string;
  payload: any;
  description: string;
}

const EVENT_TEMPLATES: EventTemplate[] = [
  {
    name: 'Payment Completed',
    type: 'payment.completed',
    description: 'Simula um pagamento aprovado',
    payload: {
      transactionId: `TX-${Date.now()}`,
      amount: 1500.00,
      currency: 'BRL',
      status: 'approved',
      paymentMethod: 'credit_card',
      customerId: 'CUST-123',
    },
  },
  {
    name: 'Payment Failed',
    type: 'payment.failed',
    description: 'Simula um pagamento recusado',
    payload: {
      transactionId: `TX-${Date.now()}`,
      amount: 2500.00,
      currency: 'BRL',
      status: 'failed',
      reason: 'insufficient_funds',
      customerId: 'CUST-456',
    },
  },
  {
    name: 'User Created',
    type: 'user.created',
    description: 'Novo usuário registrado',
    payload: {
      userId: `USER-${Date.now()}`,
      email: 'novo.usuario@example.com',
      name: 'João Silva',
      createdAt: new Date().toISOString(),
    },
  },
  {
    name: 'Order Completed',
    type: 'order.completed',
    description: 'Pedido finalizado',
    payload: {
      orderId: `ORD-${Date.now()}`,
      customerId: 'CUST-789',
      total: 350.00,
      items: [
        { product: 'Notebook', quantity: 1, price: 300.00 },
        { product: 'Mouse', quantity: 1, price: 50.00 },
      ],
      status: 'completed',
    },
  },
];

export const LiveDemo: React.FC = () => {
  const queryClient = useQueryClient();
  const [webhookSiteUrl, setWebhookSiteUrl] = useState('');
  const [generatedWebhook, setGeneratedWebhook] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);
  const [step, setStep] = useState(1);
  const [isSending, setIsSending] = useState(false);

  const createWebhookMutation = useMutation({
    mutationFn: createWebhook,
    onSuccess: (response) => {
      setGeneratedWebhook(response.data.data);
      setStep(2);
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: ({ type, payload }: { type: string; payload: any }) =>
      createEvent({ type, payload }),
    onSuccess: () => {
      setStep(3);
      setIsSending(false);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
    onError: () => {
      setIsSending(false);
    },
  });

  const handleCreateWebhook = () => {
    if (!webhookSiteUrl) return;

    createWebhookMutation.mutate({
      url: webhookSiteUrl,
      eventTypes: EVENT_TEMPLATES.map((t) => t.type),
    });
  };

  const handleSendEvent = (template: EventTemplate) => {
    // prevent multiple clicks
    if (isSending || createEventMutation.isPending) return;

    setIsSending(true);
    setSelectedTemplate(template);
    createEventMutation.mutate({
      type: template.type,
      payload: template.payload,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="live-demo-container">
      <div className="demo-header">
        <h2>Live Demo - Webhook em Ação</h2>
        <p>Veja o sistema funcionando em tempo real com webhook.site</p>
      </div>

      <div className="demo-steps">
        {/* Step 1: Enter Webhook.site URL */}
        <div className={`demo-step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Paste Your Webhook.site URL</h3>
            <p>webhook.site is a service that captures and displays webhooks in real-time</p>

            <div className="step-actions">
              <div className="manual-url-input">
                <input
                  type="text"
                  placeholder="https://webhook.site/your-unique-id"
                  value={webhookSiteUrl}
                  onChange={(e) => setWebhookSiteUrl(e.target.value)}
                  className="url-input"
                  disabled={!!generatedWebhook}
                />
              </div>

              {webhookSiteUrl && (
                <div className="generated-url">
                  <input
                    type="text"
                    value={webhookSiteUrl}
                    readOnly
                    className="url-input"
                  />
                  <button
                    className="btn btn-icon"
                    onClick={() => copyToClipboard(webhookSiteUrl)}
                    title="Copy"
                  >
                    <Copy size={16} />
                  </button>
                  <a
                    href={webhookSiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-icon"
                    title="Open"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}

              <div className="url-hint">
                <strong>Tip:</strong> Open{' '}
                <a href="https://webhook.site" target="_blank" rel="noopener noreferrer">
                  webhook.site
                </a>{' '}
                in another tab, copy your unique URL, and paste it above
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Create Webhook */}
        <div className={`demo-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Register Webhook in System</h3>
            <p>Create a webhook pointing to webhook.site</p>

            <div className="step-actions">
              <button
                className="btn btn-primary"
                onClick={handleCreateWebhook}
                disabled={!webhookSiteUrl || !!generatedWebhook || createWebhookMutation.isPending}
              >
                {createWebhookMutation.isPending ? 'Criando...' : 'Criar Webhook'}
              </button>

              {generatedWebhook && (
                <div className="webhook-created">
                  <CheckCircle2 size={20} color="#48bb78" />
                  <div>
                    <strong>Webhook Created!</strong>
                    <div className="webhook-info-small">
                      ID: {generatedWebhook.id}
                      <br />
                      Secret: {generatedWebhook.secret.substring(0, 20)}...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Send Events */}
        <div className={`demo-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Send Events</h3>
            <p>Choose a template and send an event. Watch the webhook being delivered to webhook.site!</p>

            <div className="event-templates">
              {EVENT_TEMPLATES.map((template) => (
                <div key={template.type} className="event-template-card">
                  <div className="template-info">
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                    <code className="event-type">{template.type}</code>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSendEvent(template)}
                    disabled={!generatedWebhook || isSending}
                  >
                    <Play size={14} />
                    {isSending && selectedTemplate?.type === template.type ? 'Sending...' : 'Send'}
                  </button>
                </div>
              ))}
            </div>

            {selectedTemplate && (
              <div className="sent-event-info">
                <h4>Event Sent!</h4>
                <p>
                  Evento <code>{selectedTemplate.type}</code> foi criado e o webhook está sendo
                  processado.
                </p>
                <p>
                  <strong>Now:</strong> Abra o{' '}
                  <a href={webhookSiteUrl} target="_blank" rel="noopener noreferrer">
                    webhook.site
                  </a>{' '}
                  to see the request arriving in real-time!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Instructions */}
        {step >= 3 && webhookSiteUrl && (
          <div className="demo-step active">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Check Delivery</h3>
              <div className="verification-box">
                <p>
                  <strong>On webhook.site you will see:</strong>
                </p>
                <ul>
                  <li>✅ POST request recebido</li>
                  <li>✅ Headers com X-Webhook-Signature (HMAC)</li>
                  <li>✅ Payload do evento em JSON</li>
                  <li>✅ Timestamp da entrega</li>
                </ul>
                <a
                  href={webhookSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-large"
                >
                  <ExternalLink size={16} />
                  Abrir Webhook.site
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

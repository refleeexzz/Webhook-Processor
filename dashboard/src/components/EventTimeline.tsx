import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEvents, getAuditTrail } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export const EventTimeline: React.FC = () => {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const { data: eventsData } = useQuery({
    queryKey: ['events'],
    queryFn: () => getEvents(1, 10),
    refetchInterval: 5000,
  });

  const { data: auditData } = useQuery({
    queryKey: ['audit-trail', selectedEventId],
    queryFn: () => (selectedEventId ? getAuditTrail(selectedEventId) : Promise.resolve(null)),
    enabled: !!selectedEventId,
  });

  const events = eventsData?.data.data || [];

  const toggleEvent = (eventId: string) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
      setSelectedEventId(null);
    } else {
      setExpandedEvent(eventId);
      setSelectedEventId(eventId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle size={16} color="#48bb78" />;
      case 'FAILED':
        return <XCircle size={16} color="#f56565" />;
      case 'PENDING':
      case 'PROCESSING':
        return <Clock size={16} color="#ed8936" />;
      case 'DEAD_LETTER':
        return <AlertTriangle size={16} color="#9f1239" />;
      default:
        return <Clock size={16} color="#a0aec0" />;
    }
  };

  return (
    <div className="event-timeline-container">
      <h2>Event Timeline - Últimos Eventos</h2>
      <p className="timeline-subtitle">Clique em um evento para ver o fluxo completo de processamento</p>

      <div className="timeline">
        {events.length === 0 ? (
          <div className="timeline-empty">
            <p>Nenhum evento criado ainda</p>
            <small>Use o Live Demo acima para criar eventos</small>
          </div>
        ) : (
          events.map((event: any) => (
            <div key={event.id} className="timeline-item">
              <div className="timeline-marker">
                <div className="timeline-dot"></div>
                <div className="timeline-line"></div>
              </div>

              <div className="timeline-content">
                <div
                  className="timeline-header"
                  onClick={() => toggleEvent(event.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="timeline-title">
                    <span className="event-type-badge">{event.type}</span>
                    <span className="event-time">
                      {formatDistanceToNow(new Date(event.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <button className="expand-btn">
                    {expandedEvent === event.id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>

                {expandedEvent === event.id && (
                  <div className="timeline-details">
                    <div className="event-payload">
                      <strong>Payload:</strong>
                      <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                    </div>

                    {auditData?.data.data && (
                      <div className="event-audit-trail">
                        <strong>Fluxo de Processamento:</strong>
                        <div className="audit-timeline">
                          {auditData.data.data.timeline.map((item: any, index: number) => (
                            <div key={index} className="audit-item">
                              <div className="audit-time">
                                {new Date(item.timestamp).toLocaleTimeString('pt-BR')}
                              </div>
                              <div className="audit-action">
                                {getStatusIcon(item.details?.status || 'PENDING')}
                                <span>{item.action}</span>
                              </div>
                              {item.details && (
                                <div className="audit-details">
                                  {Object.entries(item.details).map(([key, value]) => (
                                    <div key={key} className="audit-detail-item">
                                      <span className="detail-key">{key}:</span>
                                      <span className="detail-value">
                                        {typeof value === 'object'
                                          ? JSON.stringify(value)
                                          : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="delivery-summary">
                          <h4>Resumo de Entregas:</h4>
                          <div className="summary-stats">
                            <div className="stat">
                              <CheckCircle size={16} color="#48bb78" />
                              <span>{auditData.data.data.summary.successful} Sucesso</span>
                            </div>
                            <div className="stat">
                              <XCircle size={16} color="#f56565" />
                              <span>{auditData.data.data.summary.failed} Falhas</span>
                            </div>
                            <div className="stat">
                              <AlertTriangle size={16} color="#9f1239" />
                              <span>{auditData.data.data.summary.deadLetter} Dead Letter</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MetricsCard } from './components/MetricsCard';
import { WebhooksList } from './components/WebhooksList';
import { SLAMetrics } from './components/SLAMetrics';
import { LiveDemo } from './components/LiveDemo';
import { EventTimeline } from './components/EventTimeline';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'demo'>('demo');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <header className="app-header">
          <h1>Webhook Processor Dashboard</h1>
          <p>Real-time monitoring and live webhook testing</p>

          <div className="header-tabs">
            <button
              className={`tab-btn ${activeTab === 'demo' ? 'active' : ''}`}
              onClick={() => setActiveTab('demo')}
            >
              Live Demo
            </button>
            <button
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
          </div>
        </header>

        <main className="app-main">
          {activeTab === 'demo' ? (
            <>
              <section className="section">
                <LiveDemo />
              </section>

              <section className="section">
                <EventTimeline />
              </section>
            </>
          ) : (
            <>
              <section className="section">
                <MetricsCard />
              </section>

              <section className="section">
                <SLAMetrics />
              </section>

              <section className="section">
                <WebhooksList />
              </section>
            </>
          )}
        </main>

        <footer className="app-footer">
          <p>Webhook Processor - Production-ready distributed system</p>
          <a href="http://localhost:3000/docs" target="_blank" rel="noopener noreferrer">
            API Documentation
          </a>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;

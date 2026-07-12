#!/usr/bin/env node

/**
 * Script de teste end-to-end
 * Testa o fluxo completo: criar webhook -> criar evento -> verificar entrega
 */

const API_BASE = 'http://localhost:3000/api';

async function request(method, path, body) {
  const url = `${API_BASE}${path}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  return { status: response.status, data };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('[TEST] Starting end-to-end test\n');

  try {
    // 1. Criar um webhook de teste
    console.log('[1] Creating webhook...');
    const webhookRes = await request('POST', '/webhooks', {
      url: 'https://webhook.site/unique-url-here',
      eventTypes: ['test.event', 'user.created'],
    });

    if (webhookRes.status !== 201) {
      throw new Error(`Failed to create webhook: ${JSON.stringify(webhookRes.data)}`);
    }

    const webhook = webhookRes.data.data;
    console.log(`[OK] Webhook created: ${webhook.id}`);
    console.log(`    URL: ${webhook.url}`);
    console.log(`    Secret: ${webhook.secret}\n`);

    // 2. Criar um evento
    console.log('[2] Creating event...');
    const eventRes = await request('POST', '/events', {
      type: 'test.event',
      payload: {
        message: 'Hello from E2E test!',
        timestamp: new Date().toISOString(),
      },
    });

    if (eventRes.status !== 201) {
      throw new Error(`Failed to create event: ${JSON.stringify(eventRes.data)}`);
    }

    const event = eventRes.data.data;
    console.log(`[OK] Event created: ${event.id}\n`);

    // 3. Aguardar processamento (workers devem estar rodando)
    console.log('[3] Waiting for processing...');
    await sleep(2000);

    // 4. Verificar o evento e suas deliveries
    console.log('[4] Checking event details...');
    const eventCheckRes = await request('GET', `/events/${event.id}`);

    if (eventCheckRes.status !== 200) {
      throw new Error(`Failed to fetch event: ${JSON.stringify(eventCheckRes.data)}`);
    }

    const eventDetails = eventCheckRes.data.data;
    console.log(`[OK] Event has ${eventDetails.deliveries.length} deliveries\n`);

    if (eventDetails.deliveries.length > 0) {
      console.log('[INFO] Delivery statuses:');
      eventDetails.deliveries.forEach((delivery, i) => {
        console.log(`      ${i + 1}. ${delivery.id} - Status: ${delivery.status} (${delivery.attempts} attempts)`);
      });
    }

    // 5. Listar todos os webhooks
    console.log('\n[5] Listing all webhooks...');
    const webhooksRes = await request('GET', '/webhooks');
    console.log(`[OK] Found ${webhooksRes.data.data.length} webhooks\n`);

    // 6. Listar todos os eventos
    console.log('[6] Listing all events...');
    const eventsRes = await request('GET', '/events');
    console.log(`[OK] Found ${eventsRes.data.data.length} events\n`);

    console.log('[SUCCESS] End-to-end test completed successfully!\n');
    console.log('[TIPS]');
    console.log('  - Check webhook.site to see if the webhook was delivered');
    console.log('  - Run Prisma Studio to inspect database: npm run db:studio');
    console.log('  - Check worker logs for processing details\n');

  } catch (error) {
    console.error('[ERROR] Test failed:', error.message);
    process.exit(1);
  }
}

main();

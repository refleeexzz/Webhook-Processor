import { PrismaClient } from '@prisma/client';
import { generateWebhookSecret } from '../src/utils/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Starting database seed...\n');

  // Limpar dados existentes
  console.log('[*] Cleaning existing data...');
  await prisma.webhookDelivery.deleteMany();
  await prisma.event.deleteMany();
  await prisma.webhook.deleteMany();

  // Criar webhooks de exemplo
  console.log('[*] Creating sample webhooks...');
  const webhooks = await Promise.all([
    prisma.webhook.create({
      data: {
        url: 'https://webhook.site/test-1',
        secret: generateWebhookSecret(),
        eventTypes: ['user.created', 'user.updated'],
        isActive: true,
      },
    }),
    prisma.webhook.create({
      data: {
        url: 'https://webhook.site/test-2',
        secret: generateWebhookSecret(),
        eventTypes: ['order.created', 'order.completed'],
        isActive: true,
      },
    }),
    prisma.webhook.create({
      data: {
        url: 'https://webhook.site/test-3',
        secret: generateWebhookSecret(),
        eventTypes: ['user.created', 'order.created'],
        isActive: false, // Inativo
      },
    }),
  ]);

  console.log(`[OK] Created ${webhooks.length} webhooks\n`);

  // Criar eventos de exemplo
  console.log('[*] Creating sample events...');
  const events = await Promise.all([
    prisma.event.create({
      data: {
        type: 'user.created',
        payload: {
          userId: '101',
          email: 'alice@example.com',
          name: 'Alice Johnson',
        },
      },
    }),
    prisma.event.create({
      data: {
        type: 'user.updated',
        payload: {
          userId: '101',
          email: 'alice.johnson@example.com',
          name: 'Alice Johnson',
        },
      },
    }),
    prisma.event.create({
      data: {
        type: 'order.created',
        payload: {
          orderId: '5001',
          userId: '101',
          total: 129.99,
          items: [
            { product: 'Laptop Stand', quantity: 1, price: 49.99 },
            { product: 'USB-C Cable', quantity: 2, price: 40.00 },
          ],
        },
      },
    }),
    prisma.event.create({
      data: {
        type: 'order.completed',
        payload: {
          orderId: '5001',
          status: 'shipped',
          trackingCode: 'ABC123XYZ',
        },
      },
    }),
  ]);

  console.log(`[OK] Created ${events.length} events\n`);

  console.log('[SUCCESS] Seed completed successfully!\n');
  console.log('[SUMMARY]');
  console.log(`  - ${webhooks.length} webhooks created`);
  console.log(`  - ${events.length} events created`);
  console.log('\n[NEXT STEPS]');
  console.log('  1. Start the API: npm run dev');
  console.log('  2. Start the workers: npm run worker');
  console.log('  3. Check metrics: curl http://localhost:3000/api/metrics\n');
}

main()
  .catch((e) => {
    console.error('[ERROR] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

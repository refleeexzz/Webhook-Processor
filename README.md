# Webhook Processor

Sistema distribuído de processamento e entrega de webhooks construído com Node.js, TypeScript, PostgreSQL e Redis.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **PostgreSQL** (banco de dados relacional)
- **Redis** + **BullMQ** (filas de processamento)
- **Express** (API REST)
- **Prisma** (ORM)
- **Docker** (containerização)

## 📋 Funcionalidades

- ✅ Criação de eventos via API REST
- ✅ Cadastro de webhooks com URLs de destino
- ✅ Processamento assíncrono com filas
- ✅ Entrega de webhooks com retry automático
- ✅ Backoff exponencial para retentativas
- ✅ Assinatura HMAC para validação
- ✅ Dead letter queue para falhas permanentes
- ✅ Idempotência e consistência

## 🏗️ Arquitetura

```
┌─────────────┐
│   API REST  │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│ PostgreSQL  │────▶│ Event Queue  │
└─────────────┘     └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │Event Worker  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │Delivery Queue│
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │Delivery Worker│
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │Webhook Target│
                    └──────────────┘
```

## 🛠️ Setup

### 1. Clonar o repositório

```bash
git clone <seu-repo>
cd webhook-processor
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

### 4. Subir os containers (PostgreSQL + Redis)

```bash
docker-compose up -d
```

### 5. Executar as migrações

```bash
npm run db:generate
npm run db:migrate
```

### 6. Iniciar a aplicação

Em terminais separados:

```bash
# Terminal 1: API
npm run dev

# Terminal 2: Workers
npm run worker
```

## 📡 Endpoints

### Criar evento

```bash
POST /api/events
Content-Type: application/json

{
  "type": "user.created",
  "payload": {
    "userId": "123",
    "email": "user@example.com"
  }
}
```

### Listar eventos

```bash
GET /api/events?page=1&limit=20
```

### Buscar evento específico

```bash
GET /api/events/:id
```

### Criar webhook

```bash
POST /api/webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "eventTypes": ["user.created", "user.updated"]
}
```

### Listar webhooks

```bash
GET /api/webhooks
```

### Atualizar webhook

```bash
PATCH /api/webhooks/:id
Content-Type: application/json

{
  "isActive": false
}
```

### Deletar webhook

```bash
DELETE /api/webhooks/:id
```

## 🔐 Segurança

Todos os webhooks são assinados com HMAC SHA-256. O header `X-Webhook-Signature` contém a assinatura.

Para validar:

```typescript
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## 🔄 Retry Logic

- Retry automático com backoff exponencial
- 5 tentativas por padrão
- Delays: 1s, 2s, 4s, 8s, 16s
- Após esgotar tentativas, move para dead letter queue

## 📊 Monitoramento

Acesse o Prisma Studio para visualizar os dados:

```bash
npm run db:studio
```

## 🧪 Testando

Você pode usar o `httpie` ou `curl` para testar:

```bash
# Criar webhook
http POST localhost:3000/api/webhooks url="https://webhook.site/unique-id" eventTypes:='["test.event"]'

# Criar evento
http POST localhost:3000/api/events type="test.event" payload:='{"message":"Hello World"}'
```

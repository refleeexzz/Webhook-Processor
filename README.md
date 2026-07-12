# Webhook Processor

![CI/CD](https://img.shields.io/badge/CI%2FCD-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Redis](https://img.shields.io/badge/Redis-7-red)
![Docker](https://img.shields.io/badge/Docker-ready-blue)

Sistema distribuído de processamento e entrega de webhooks construído com Node.js, TypeScript, PostgreSQL e Redis.

## Tecnologias

- **Node.js** + **TypeScript**
- **PostgreSQL** (banco de dados relacional)
- **Redis** + **BullMQ** (filas de processamento)
- **Express** (API REST)
- **Prisma** (ORM)
- **Docker** (containerização)

## Funcionalidades

- Criação de eventos via API REST
- Cadastro de webhooks com URLs de destino
- Processamento assíncrono com filas (BullMQ)
- Entrega de webhooks com retry automático
- Backoff exponencial para retentativas
- Assinatura HMAC SHA-256 para validação
- Dead letter queue para falhas permanentes
- Idempotência e consistência de dados
- Logging estruturado (JSON)
- Error handling robusto
- Testes automatizados (Jest)

## Arquitetura

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

## Setup

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

## Endpoints

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

## Segurança

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

## Retry Logic

- Retry automático com backoff exponencial
- 5 tentativas por padrão
- Delays: 1s, 2s, 4s, 8s, 16s
- Após esgotar tentativas, move para dead letter queue

## Monitoramento

Acesse o Prisma Studio para visualizar os dados:

```bash
npm run db:studio
```

## Testando

### Testes Automatizados

```bash
# Rodar todos os testes
npm test

# Rodar em modo watch
npm run test:watch

# Rodar com cobertura
npm run test:coverage
```

### Teste End-to-End

```bash
# Com a API e workers rodando, execute:
node scripts/test-e2e.js
```

### Teste Manual

Você pode usar `curl` ou `httpie`:

```bash
# Criar webhook
curl -X POST localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{"url":"https://webhook.site/unique-id","eventTypes":["test.event"]}'

# Criar evento
curl -X POST localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"type":"test.event","payload":{"message":"Hello World"}}'
```

## Documentação

- [Exemplos de API](./docs/API_EXAMPLES.md)
- [Arquitetura do Sistema](./docs/ARCHITECTURE.md)

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia API em modo watch
npm run worker       # Inicia workers

# Build
npm run build        # Compila TypeScript

# Database
npm run db:migrate   # Roda migrations
npm run db:generate  # Gera Prisma Client
npm run db:studio    # Abre Prisma Studio

# Qualidade de código
npm run lint         # Roda ESLint
npm test             # Roda testes
```

## Por que este projeto demonstra competência técnica?

Este projeto foi construído para demonstrar conhecimentos alinhados com ambientes de produção modernos:

### 1. **Arquitetura Distribuída**
- Sistema desacoplado com filas (como empresas de fintech fazem)
- Processamento assíncrono resiliente a falhas
- Escalabilidade horizontal

### 2. **Confiabilidade**
- Retry automático com backoff exponencial
- Dead letter queue para falhas irrecuperáveis
- Idempotência garantida
- Error handling robusto

### 3. **Segurança**
- Assinatura HMAC SHA-256
- Validação de payloads com Zod
- Tratamento seguro de secrets

### 4. **Boas Práticas**
- TypeScript com types estritos
- Logging estruturado (JSON)
- Separação clara de responsabilidades (services/controllers)
- Testes automatizados
- Documentação completa

### 5. **Infraestrutura**
- Docker para ambientes consistentes
- Migrações de banco versionadas (Prisma)
- Variáveis de ambiente configuráveis
- Graceful shutdown handling

## Notas de Implementação

- **PostgreSQL**: Escolhido pela consistência ACID e suporte a JSON
- **BullMQ**: Sistema de filas robusto com retry nativo
- **Prisma**: ORM type-safe com migrations
- **Express**: Framework minimalista e amplamente adotado

# Arquitetura do Sistema

## Visão Geral

Este é um sistema distribuído para processamento e entrega de webhooks, construído com foco em confiabilidade, escalabilidade e consistência.

## Componentes

### 1. API REST (Express)

Responsável por receber requisições HTTP e expor endpoints para:
- Gerenciamento de webhooks (CRUD)
- Criação de eventos
- Consulta de status de entregas

**Características:**
- Validação de entrada com Zod
- Logging estruturado de requisições
- Error handling centralizado
- Separação clara entre controllers/services

### 2. PostgreSQL

Banco de dados relacional que armazena:

**Tabela `events`:**
- Eventos criados pela API
- Payload JSON flexível
- Índices em `type` e `createdAt` para queries rápidas

**Tabela `webhooks`:**
- URLs de destino
- Secrets para assinatura HMAC
- Event types que o webhook quer receber
- Flag `isActive` para enable/disable

**Tabela `webhook_deliveries`:**
- Registro de cada tentativa de entrega
- Status: PENDING → PROCESSING → SUCCESS/FAILED → DEAD_LETTER
- Tracking de tentativas, timestamps e respostas

### 3. Redis + BullMQ

Sistema de filas para processamento assíncrono.

**Fila `events`:**
- Recebe novos eventos
- Worker processa e cria deliveries

**Fila `webhook-deliveries`:**
- Recebe deliveries a serem enviadas
- Worker tenta entregar com retry automático

**Benefícios:**
- Desacoplamento entre API e processamento
- Resiliência a falhas
- Escalabilidade horizontal (múltiplos workers)
- Retry com backoff exponencial

### 4. Workers

**Event Worker:**
```
1. Recebe evento da fila
2. Busca webhooks ativos para o event type
3. Cria um delivery para cada webhook
4. Adiciona cada delivery à fila de entregas
```

**Delivery Worker:**
```
1. Recebe delivery da fila
2. Monta payload e assina com HMAC
3. Tenta enviar POST HTTP
4. Em caso de sucesso: marca como SUCCESS
5. Em caso de falha:
   - Se ainda tem tentativas: agenda retry com backoff
   - Se esgotou tentativas: marca como DEAD_LETTER
```

## Fluxo Completo

```
┌─────────┐
│ Cliente │
└────┬────┘
     │ POST /api/events
     ▼
┌─────────────┐
│  API REST   │
└──────┬──────┘
       │ Cria evento no PostgreSQL
       │ Adiciona job na fila
       ▼
┌─────────────┐
│Event Queue  │ (Redis)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Event Worker │
└──────┬──────┘
       │ Para cada webhook ativo:
       │ - Cria delivery no PostgreSQL
       │ - Adiciona job na fila
       ▼
┌─────────────┐
│Delivery Q   │ (Redis)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Delivery     │
│Worker       │
└──────┬──────┘
       │ HTTP POST com HMAC
       ▼
┌─────────────┐
│Webhook URL  │
└─────────────┘
```

## Garantias de Consistência

### Idempotência

- IDs únicos (UUID) para eventos e deliveries
- Header `X-Webhook-Id` permite deduplicação no receptor

### Retry com Backoff

```
Tentativa 0: Imediato
Tentativa 1: +1s
Tentativa 2: +2s
Tentativa 3: +4s
Tentativa 4: +8s
Tentativa 5: +16s (máximo 5 tentativas)
```

### Dead Letter Queue

Deliveries que falham após todas as tentativas vão para `DEAD_LETTER`:
- Não são mais retentadas automaticamente
- Podem ser inspecionadas manualmente
- Facilitam debugging de problemas persistentes

## Segurança

### Assinatura HMAC SHA-256

Cada webhook é assinado:
```
signature = HMAC-SHA256(payload, webhook.secret)
```

O receptor pode validar que o webhook veio do sistema legítimo.

### Headers Enviados

```
Content-Type: application/json
X-Webhook-Signature: <hex-encoded-hmac>
X-Webhook-Id: <delivery-uuid>
```

## Escalabilidade

### Horizontal Scaling

- **API**: Múltiplas instâncias atrás de load balancer
- **Workers**: Múltiplos processos (configurável via `WORKER_CONCURRENCY`)
- **PostgreSQL**: Read replicas para queries pesadas
- **Redis**: Cluster mode para alta disponibilidade

### Performance

- Índices otimizados no PostgreSQL
- Processamento assíncrono (API não bloqueia)
- Connection pooling (Prisma)
- Timeout em requests HTTP (5s por padrão)

## Observabilidade

### Logs Estruturados

Todos os logs são JSON com campos:
- `timestamp`
- `level` (INFO/WARN/ERROR/DEBUG)
- `message`
- Context adicional (ids, durations, etc)

### Métricas Importantes

- Taxa de sucesso de deliveries
- Latência de processamento
- Tamanho das filas
- Número de dead letters

## Próximas Melhorias

- [ ] Webhooks com múltiplas tentativas de entrega paralelas
- [ ] Dashboard web para monitoramento
- [ ] Métricas com Prometheus
- [ ] Tracing distribuído
- [ ] Rate limiting por webhook
- [ ] Suporte a batch events


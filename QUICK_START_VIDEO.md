# Quick Start - Gravação do Vídeo

## Passo a Passo RÁPIDO

### 1. Iniciar Infraestrutura (uma vez só)
```bash
docker-compose up -d postgres redis
```

### 2. Terminal 1: API + Workers
```bash
npm run dev:all
```

### 3. Terminal 2: Dashboard
```bash
cd dashboard
npm start
```

## URLs para Demonstração

```
Dashboard:     http://localhost:3001
Swagger Docs:  http://localhost:3000/docs
API Metrics:   http://localhost:3000/api/metrics
Health Check:  http://localhost:3000/api/health
```

## Fluxo do Vídeo (2-3 min)

### 1. Introdução (10s)
Mostrar VSCode com o código aberto

### 2. Swagger Documentation (30s)
- Abrir http://localhost:3000/docs
- Mostrar endpoints organizados
- Expandir algum endpoint (POST /events)
- Destacar: "Documentação automática OpenAPI"

### 3. Dashboard React (45s)
- Abrir http://localhost:3001
- Mostrar métricas atualizando em tempo real
- Criar um webhook ao vivo
- Mostrar gráficos SLA
- Navegar pelos componentes

### 4. Teste de Idempotência (40s)
No Swagger, fazer 2x o mesmo request:

**POST /api/events**
```json
Headers:
  Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

Body:
{
  "type": "payment.completed",
  "payload": {
    "amount": 1500.00,
    "currency": "BRL",
    "transactionId": "TX-123456"
  }
}
```

Mostrar que retorna o MESMO evento nas 2 requisições (idempotência funcionando)

### 5. Reconciliation (30s)
- Abrir http://localhost:3000/api/reconciliation/sla no navegador
- Mostrar JSON com métricas
- Destacar: "Compliance e auditoria para fintech"

### 6. Código (15s)
Voltar pro VSCode e mostrar rapidamente:
- src/middlewares/idempotency.ts
- src/services/reconciliation.service.ts

### 7. Conclusão (10s)
"Stack production-ready com rate limiting, idempotência, audit logs, CI/CD, Docker e testes."

## Comandos de Teste Úteis

### Criar Webhook via cURL:
```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://webhook.site/unique-url",
    "eventTypes": ["payment.completed", "payment.failed"]
  }'
```

### Criar Evento com Idempotência:
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "type": "payment.completed",
    "payload": {
      "amount": 1500.00,
      "currency": "BRL"
    }
  }'
```

### Ver Métricas:
```bash
curl http://localhost:3000/api/metrics | jq
```

## Troubleshooting

Se algo não funcionar:

```bash
# Parar tudo
docker-compose down
pkill -f node

# Recomeçar
docker-compose up -d postgres redis
npm run dev:all
```

## Dicas para Gravação

1. **Fechar abas desnecessárias** do navegador
2. **Aumentar zoom** do navegador para 125% ou 150%
3. **Zoom no VSCode** também (Ctrl + +)
4. **Preparar os comandos** em um arquivo txt para copiar/colar
5. **Gravar em 1080p** no mínimo
6. **Falar com confiança** sobre os conceitos fintech

Boa sorte! 🚀

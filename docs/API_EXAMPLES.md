# Exemplos de Uso da API

## 1. Criar um Webhook

```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://webhook.site/your-unique-url",
    "eventTypes": ["user.created", "user.updated", "order.completed"]
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "url": "https://webhook.site/your-unique-url",
    "secret": "generated-secret-here",
    "eventTypes": ["user.created", "user.updated", "order.completed"],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 2. Listar Webhooks

```bash
curl http://localhost:3000/api/webhooks
```

## 3. Buscar Webhook Específico

```bash
curl http://localhost:3000/api/webhooks/{webhook-id}
```

## 4. Atualizar Webhook

```bash
curl -X PATCH http://localhost:3000/api/webhooks/{webhook-id} \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

## 5. Deletar Webhook

```bash
curl -X DELETE http://localhost:3000/api/webhooks/{webhook-id}
```

## 6. Criar um Evento

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "user.created",
    "payload": {
      "userId": "123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "event-uuid",
    "type": "user.created",
    "payload": {
      "userId": "123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 7. Listar Eventos (com paginação)

```bash
curl "http://localhost:3000/api/events?page=1&limit=20"
```

## 8. Buscar Evento Específico (com deliveries)

```bash
curl http://localhost:3000/api/events/{event-id}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "event-uuid",
    "type": "user.created",
    "payload": {...},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "deliveries": [
      {
        "id": "delivery-uuid",
        "webhookId": "webhook-uuid",
        "status": "SUCCESS",
        "attempts": 1,
        "lastAttemptAt": "2024-01-01T00:00:01.000Z",
        "responseStatus": 200
      }
    ]
  }
}
```

## Validando Webhooks no seu Servidor

Quando você recebe um webhook, valide a assinatura:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// No seu endpoint
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = 'your-webhook-secret';

  if (!verifyWebhook(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Processar webhook
  console.log('Valid webhook received:', req.body);
  res.status(200).json({ received: true });
});
```

## Formato do Payload do Webhook

```json
{
  "id": "event-uuid",
  "type": "user.created",
  "data": {
    "userId": "123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Headers do Webhook

```
Content-Type: application/json
X-Webhook-Signature: <hmac-sha256-signature>
X-Webhook-Id: <delivery-uuid>
```

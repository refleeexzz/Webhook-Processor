# Docker Setup

## Desenvolvimento Local (apenas infraestrutura)

Rode apenas PostgreSQL e Redis:

```bash
docker-compose up -d postgres redis
```

Depois rode API e Workers localmente:

```bash
npm run dev:all
```

## Ambiente Completo (tudo no Docker)

Rode API, Workers, PostgreSQL e Redis:

```bash
docker-compose up -d
```

A API estará disponível em `http://localhost:3000`.

### Ver logs

```bash
# Todos os serviços
docker-compose logs -f

# Apenas API
docker-compose logs -f api

# Apenas Workers
docker-compose logs -f worker
```

### Executar migrations

As migrations rodam automaticamente quando o container da API inicia.

Para rodar manualmente:

```bash
docker-compose exec api npx prisma migrate deploy
```

### Acessar banco de dados

```bash
docker-compose exec postgres psql -U webhook_user -d webhook_db
```

### Rebuildar imagens

```bash
docker-compose build
docker-compose up -d
```

### Limpar tudo

```bash
# Para e remove containers
docker-compose down

# Remove também volumes (CUIDADO: apaga dados do banco!)
docker-compose down -v
```

## Variáveis de Ambiente

No `docker-compose.yml`, você pode customizar:

- `API_SECRET`: Secret para assinatura
- `WORKER_CONCURRENCY`: Número de jobs simultâneos
- `WEBHOOK_TIMEOUT_MS`: Timeout de requisições HTTP
- `MAX_RETRY_ATTEMPTS`: Tentativas máximas de retry

## Health Checks

Os containers possuem health checks:

```bash
# Ver status
docker ps

# API health check
curl http://localhost:3000/api/health

# Metrics
curl http://localhost:3000/api/metrics
```

## Troubleshooting

### Container não inicia

```bash
# Ver logs de erro
docker-compose logs api

# Verificar se as portas estão em uso
netstat -an | grep 3000  # Windows
lsof -i :3000            # Linux/Mac
```

### Database connection error

Certifique-se de que o PostgreSQL está rodando:

```bash
docker-compose ps postgres
docker-compose logs postgres
```

### Workers não processam

Verifique os logs do Redis e do worker:

```bash
docker-compose logs redis
docker-compose logs worker
```

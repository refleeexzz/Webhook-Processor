# Contribuindo

## Setup Local

1. **Clonar o repositório**
```bash
git clone <repo-url>
cd webhook-processor
```

2. **Instalar dependências**
```bash
npm install
```

3. **Configurar ambiente**
```bash
cp .env.example .env
# Edite .env com suas configurações
```

4. **Subir infraestrutura**
```bash
docker-compose up -d postgres redis
```

5. **Executar migrations**
```bash
npm run db:migrate
```

6. **Popular banco (opcional)**
```bash
npm run db:seed
```

7. **Iniciar aplicação**
```bash
# Terminal 1: API
npm run dev

# Terminal 2: Workers
npm run worker
```

## Desenvolvimento

### Estrutura de Pastas

```
src/
├── config/          # Configurações (DB, Redis, env)
├── controllers/     # Controllers da API
├── middlewares/     # Middlewares Express
├── routes/          # Definição de rotas
├── services/        # Lógica de negócio
├── utils/           # Utilitários
├── schemas/         # Validação Zod
├── workers/         # Workers BullMQ
└── __tests__/       # Testes
```

### Boas Práticas

- **TypeScript estrito**: Use tipos explícitos
- **Validação**: Sempre valide entrada com Zod
- **Logging**: Use `logger` ao invés de `console.log`
- **Error handling**: Deixe o middleware centralizado tratar
- **Testes**: Escreva testes para novas features
- **Commits**: Use conventional commits

### Conventional Commits

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc
refactor: code change that neither fixes a bug nor adds a feature
test: adding tests
chore: updating build tasks, package manager configs, etc
```

### Rodando Testes

```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Com coverage
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## Pull Requests

1. Crie uma branch a partir de `develop`
2. Faça suas mudanças
3. Escreva/atualize testes
4. Rode `npm run lint` e `npm test`
5. Commit com mensagens descritivas
6. Push e abra um PR para `develop`

## Debugging

### API
- Logs estruturados em JSON
- Use Prisma Studio: `npm run db:studio`
- Check metrics: `curl localhost:3000/api/metrics`

### Workers
- Logs mostram jobId, deliveryId, attempts
- Inspecione filas no Redis: `redis-cli`
- Dead letter deliveries: query `WHERE status = 'DEAD_LETTER'`

## Questões?

Abra uma issue ou entre em contato!

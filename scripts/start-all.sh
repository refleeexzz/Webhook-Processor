#!/bin/bash

# Script para iniciar todo o ambiente de desenvolvimento

echo "[SETUP] Starting full development environment..."

# Verificar se PostgreSQL e Redis estão rodando
echo "[CHECK] Checking infrastructure..."
docker-compose ps | grep -q "postgres.*Up" || {
  echo "[*] Starting PostgreSQL and Redis..."
  docker-compose up -d postgres redis
  echo "[*] Waiting for services to be ready..."
  sleep 5
}

# Garantir que as migrations estão aplicadas
echo "[*] Ensuring database is up to date..."
npx prisma migrate deploy

# Popular banco se estiver vazio
echo "[*] Seeding database (if empty)..."
npm run db:seed 2>/dev/null || true

echo ""
echo "[SUCCESS] Environment is ready!"
echo ""
echo "Now run in separate terminals:"
echo ""
echo "  Terminal 1: npm run dev:all     # API + Workers"
echo "  Terminal 2: cd dashboard && npm start  # Dashboard"
echo ""
echo "URLs:"
echo "  API:       http://localhost:3000"
echo "  Swagger:   http://localhost:3000/docs"
echo "  Dashboard: http://localhost:3001"
echo "  Metrics:   http://localhost:3000/api/metrics"
echo ""

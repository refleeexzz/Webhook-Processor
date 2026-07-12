#!/bin/bash

echo "========================================="
echo "  TESTE COMPLETO DO SISTEMA"
echo "========================================="
echo ""

# 1. Lint
echo "[1/6] Testando ESLint..."
npm run lint
if [ $? -ne 0 ]; then
  echo "[ERROR] Lint falhou"
  exit 1
fi
echo "[OK] Lint passou com warnings permitidos"
echo ""

# 2. Build
echo "[2/6] Testando Build TypeScript..."
npm run build
if [ $? -ne 0 ]; then
  echo "[ERROR] Build falhou"
  exit 1
fi
echo "[OK] Build compilou com sucesso"
echo ""

# 3. Tests
echo "[3/6] Rodando Testes..."
npm test -- --passWithNoTests
if [ $? -ne 0 ]; then
  echo "[ERROR] Testes falharam"
  exit 1
fi
echo "[OK] Testes passaram"
echo ""

# 4. Check Docker
echo "[4/6] Verificando Docker..."
if ! command -v docker &> /dev/null; then
  echo "[WARNING] Docker não encontrado, mas não é crítico para desenvolvimento local"
else
  echo "[OK] Docker disponível"
fi
echo ""

# 5. Check Prisma
echo "[5/6] Verificando Prisma..."
npx prisma validate
if [ $? -ne 0 ]; then
  echo "[ERROR] Schema do Prisma inválido"
  exit 1
fi
echo "[OK] Schema do Prisma válido"
echo ""

# 6. Check Dashboard
echo "[6/6] Verificando Dashboard..."
cd dashboard
if [ -f "package.json" ]; then
  echo "[OK] Dashboard encontrado"
  if [ ! -d "node_modules" ]; then
    echo "[INFO] Instalando dependências do dashboard..."
    npm install
  fi
  echo "[OK] Dashboard pronto"
else
  echo "[WARNING] Dashboard não encontrado"
fi
cd ..
echo ""

echo "========================================="
echo "  TODOS OS TESTES PASSARAM! ✓"
echo "========================================="
echo ""
echo "Próximos passos:"
echo "  1. docker-compose up -d postgres redis"
echo "  2. npm run dev:all"
echo "  3. cd dashboard && npm start"
echo ""
echo "URLs:"
echo "  Dashboard:  http://localhost:3001"
echo "  API:        http://localhost:3000"
echo "  Swagger:    http://localhost:3000/docs"
echo ""

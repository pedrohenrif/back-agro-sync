#!/bin/bash
# Setup inicial: copia o schema Prisma para todos os microserviços
# Execute: bash setup-services.sh

SCHEMA_SOURCE="./prisma/schema.prisma"
SERVICES=(
  "services/auth-service"
  "services/garden-service"
  "services/supply-service"
  "services/task-service"
  "services/ai-service"
)

echo "🌱 AgroSync — Configurando microserviços..."

for SERVICE in "${SERVICES[@]}"; do
  PRISMA_DIR="./$SERVICE/prisma"
  mkdir -p "$PRISMA_DIR"
  cp "$SCHEMA_SOURCE" "$PRISMA_DIR/schema.prisma"
  echo "  ✔ Prisma schema copiado para $SERVICE"
done

echo ""
echo "📦 Instalando dependências..."
for SERVICE in "${SERVICES[@]}"; do
  echo "  → npm install em $SERVICE"
  (cd "./$SERVICE" && npm install --silent)
done

(cd "./api-gateway" && npm install --silent)
echo "  ✔ api-gateway"

echo ""
echo "✅ Setup concluído! Para subir tudo:"
echo "   docker-compose up --build"

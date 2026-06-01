#!/bin/bash

# Docker Compose helper - controla Nginx automáticamente según NODE_ENV
# Uso: ./docker-compose.sh [comando] [opciones]
# Ejemplos:
#   ./docker-compose.sh up -d          # Desarrollo (por defecto)
#   NODE_ENV=production ./docker-compose.sh up -d  # Producción

set -e

# Cargar NODE_ENV desde .env si no está definido
if [ -z "$NODE_ENV" ] && [ -f .env ]; then
    export NODE_ENV=$(grep -E '^NODE_ENV=' .env | cut -d'=' -f2)
fi

MODE="${NODE_ENV:-development}"

if [ "$MODE" = "production" ]; then
    echo "🐳 Modo: PRODUCTION (con Nginx)"
    docker compose --profile prod up "$@"
else
    echo "🐳 Modo: DEVELOPMENT (sin Nginx)"
    docker compose up "$@"
fi

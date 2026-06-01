#!/bin/bash
set -e

# =============================================================================
# Deployment Script for API Nest
# =============================================================================
# Usage: ./scripts/deploy.sh [environment]
# Environments: development, production (default: production)
# =============================================================================

ENVIRONMENT=${1:-production}
VERSION=${2:-latest}

echo "============================================"
echo "  Deploying API Nest - $ENVIRONMENT"
echo "============================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it"
    exit 1
fi

# Pull latest changes if in git repository
if [ -d .git ]; then
    echo "Pulling latest changes..."
    git pull origin main || echo "Warning: Could not pull latest changes"
fi

# Build the images
echo "Building Docker images..."
docker compose -f docker-compose.$ENVIRONMENT.yml build --no-cache

# Run database migrations
echo "Running database migrations..."
docker compose -f docker-compose.$ENVIRONMENT.yml run --rm migrate

# Start the services
echo "Starting services..."
docker compose -f docker-compose.$ENVIRONMENT.yml up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 10

# Check service health
echo "Checking service health..."
docker compose -f docker-compose.$ENVIRONMENT.yml ps

echo "============================================"
echo "  Deployment Complete!"
echo "============================================"
echo "API URL: http://localhost:$([ "$ENVIRONMENT" = "production" ] && echo "80" || echo "3000")"
echo "Health: http://localhost:$([ "$ENVIRONMENT" = "production" ] && echo "80" || echo "3000")/health"
echo ""
echo "View logs: docker compose -f docker-compose.$ENVIRONMENT.yml logs -f"
echo "Stop services: docker compose -f docker-compose.$ENVIRONMENT.yml down"

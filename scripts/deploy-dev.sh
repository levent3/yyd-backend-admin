#!/bin/bash

# YYD Backend - Development Deployment Script
# This script helps you deploy the application in development mode

set -e

echo "🚀 YYD Backend - Development Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo "Creating .env from .env.example..."

    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created${NC}"
        echo -e "${YELLOW}⚠️  Please update .env with your configuration before continuing${NC}"
        exit 1
    else
        echo -e "${RED}❌ .env.example not found!${NC}"
        exit 1
    fi
fi

echo "📦 Stopping existing containers..."
docker-compose down

echo ""
echo "🏗️  Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "📊 Service logs (last 20 lines):"
docker-compose logs --tail=20 api

echo ""
echo -e "${GREEN}✅ Development deployment complete!${NC}"
echo ""
echo "📝 Useful commands:"
echo "  - View logs:          docker-compose logs -f"
echo "  - View API logs:      docker-compose logs -f api"
echo "  - Stop services:      docker-compose down"
echo "  - Restart API:        docker-compose restart api"
echo "  - Access database:    docker-compose exec postgres psql -U \$POSTGRES_USER -d \$POSTGRES_DB"
echo "  - Run migrations:     docker-compose exec api npm run db:migrate"
echo "  - Run seed:           docker-compose exec api npm run db:seed"
echo "  - Prisma Studio:      docker-compose exec api npm run db:studio"
echo ""
echo "🌐 API URL: http://localhost:5000"
echo "📊 Prisma Studio: http://localhost:5555"
echo ""

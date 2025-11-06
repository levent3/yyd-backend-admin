#!/bin/bash

# YYD Backend - Production Deployment Script
# This script helps you deploy the application in production mode

set -e

echo "🚀 YYD Backend - Production Deployment"
echo "======================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}⚠️  WARNING: Running as root is not recommended!${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env file with production configuration"
    exit 1
fi

# Check if NODE_ENV is production
if ! grep -q "NODE_ENV=production" .env; then
    echo -e "${YELLOW}⚠️  NODE_ENV is not set to production in .env${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${BLUE}📋 Pre-deployment checklist:${NC}"
echo "  [1] .env file configured for production"
echo "  [2] Database backups created"
echo "  [3] Code pulled from repository"
echo "  [4] All tests passing"
echo ""
read -p "All checks passed? Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

echo ""
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

echo ""
echo "🏗️  Building production Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo ""
echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Check service health
echo ""
echo "🔍 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Wait for health checks
echo ""
echo "⏳ Waiting for health checks to pass..."
sleep 20

# Verify API is responding
echo ""
echo "🔍 Verifying API health..."
if curl -f http://localhost:5000/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ API is healthy!${NC}"
else
    echo -e "${YELLOW}⚠️  API health check failed, checking logs...${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=50 api
fi

echo ""
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}✅ Production deployment complete!${NC}"
echo ""
echo "📝 Useful commands:"
echo "  - View logs:          docker-compose -f docker-compose.prod.yml logs -f"
echo "  - View API logs:      docker-compose -f docker-compose.prod.yml logs -f api"
echo "  - Stop services:      docker-compose -f docker-compose.prod.yml down"
echo "  - Restart API:        docker-compose -f docker-compose.prod.yml restart api"
echo "  - Check status:       docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "🌐 API URL: http://localhost:5000"
echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo "  - Set up Nginx reverse proxy"
echo "  - Configure SSL certificates"
echo "  - Set up monitoring and logging"
echo "  - Configure automated backups"
echo ""

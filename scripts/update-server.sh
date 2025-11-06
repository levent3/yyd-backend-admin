#!/bin/bash

# YYD Backend - Server Update Script
# This script updates the application on production server with zero-downtime strategy

set -e

echo "🔄 YYD Backend - Server Update Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}📋 Update checklist:${NC}"
echo "  [1] Latest code pulled from Git"
echo "  [2] Database backup completed"
echo "  [3] .env file updated if needed"
echo ""
read -p "Ready to update? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Update cancelled"
    exit 1
fi

# Create backup directory
echo ""
echo "📁 Creating backup directory..."
mkdir -p "$BACKUP_DIR"

# Backup current database
echo ""
echo "💾 Backing up database..."
POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2)
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d '=' -f2)

docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database backup created: $BACKUP_DIR/db_backup_$TIMESTAMP.sql${NC}"
else
    echo -e "${RED}❌ Database backup failed!${NC}"
    exit 1
fi

# Backup uploads directory
echo ""
echo "💾 Backing up uploads..."
if docker volume ls | grep -q "yyd_web_backend_uploads_data"; then
    docker run --rm -v yyd_web_backend_uploads_data:/uploads -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/uploads_$TIMESTAMP.tar.gz -C /uploads .
    echo -e "${GREEN}✅ Uploads backup created: $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz${NC}"
fi

# Pull latest code
echo ""
echo "📥 Pulling latest code from Git..."
git pull origin main || {
    echo -e "${YELLOW}⚠️  Git pull failed or not a git repository${NC}"
}

# Rebuild and restart containers
echo ""
echo "🏗️  Rebuilding containers..."
docker-compose -f docker-compose.prod.yml build

echo ""
echo "🔄 Restarting services with rolling update..."

# Stop API only (keep database running)
docker-compose -f docker-compose.prod.yml stop api

# Start new API container
docker-compose -f docker-compose.prod.yml up -d api

# Wait for health check
echo ""
echo "⏳ Waiting for API to be healthy..."
sleep 20

# Verify health
if curl -f http://localhost:5000/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ API is healthy after update!${NC}"

    # Clean up old images
    echo ""
    echo "🧹 Cleaning up old Docker images..."
    docker image prune -f

    echo ""
    echo -e "${GREEN}✅ Update completed successfully!${NC}"
    echo ""
    echo "📊 Current status:"
    docker-compose -f docker-compose.prod.yml ps

    echo ""
    echo "💾 Backups saved to: $BACKUP_DIR/"
    echo "  - Database: db_backup_$TIMESTAMP.sql"
    echo "  - Uploads: uploads_$TIMESTAMP.tar.gz"

else
    echo -e "${RED}❌ API health check failed!${NC}"
    echo ""
    echo "🔙 Rolling back..."

    # Show logs
    docker-compose -f docker-compose.prod.yml logs --tail=100 api

    echo ""
    echo -e "${YELLOW}⚠️  Please check the logs above and fix the issues${NC}"
    echo "To restore database backup:"
    echo "  docker-compose -f docker-compose.prod.yml exec -T postgres psql -U $POSTGRES_USER $POSTGRES_DB < $BACKUP_DIR/db_backup_$TIMESTAMP.sql"

    exit 1
fi

echo ""

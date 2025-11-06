#!/bin/bash

# YYD Backend - Migration Helper Script
# This script helps manage Prisma migrations

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔧 YYD Backend - Migration Helper"
echo "=================================="
echo ""

# Function to show menu
show_menu() {
    echo "Please select an option:"
    echo ""
    echo "  1) Create new migration"
    echo "  2) Check migration status"
    echo "  3) Apply pending migrations"
    echo "  4) Reset database (⚠️  DESTRUCTIVE)"
    echo "  5) Generate Prisma Client"
    echo "  6) Run seed"
    echo "  7) Open Prisma Studio"
    echo "  8) Check for drift"
    echo "  9) Exit"
    echo ""
}

# Function to create migration
create_migration() {
    echo ""
    read -p "Enter migration name (e.g., add_user_table): " migration_name

    if [ -z "$migration_name" ]; then
        echo -e "${RED}❌ Migration name cannot be empty${NC}"
        return
    fi

    echo ""
    echo "Creating migration: $migration_name"
    npx prisma migrate dev --name "$migration_name"

    echo -e "${GREEN}✅ Migration created successfully${NC}"
}

# Function to check status
check_status() {
    echo ""
    echo "📊 Checking migration status..."
    npx prisma migrate status
}

# Function to apply migrations
apply_migrations() {
    echo ""
    echo "🔄 Applying pending migrations..."
    npx prisma migrate deploy

    echo -e "${GREEN}✅ Migrations applied successfully${NC}"
}

# Function to reset database
reset_database() {
    echo ""
    echo -e "${RED}⚠️  WARNING: This will DELETE ALL DATA!${NC}"
    read -p "Are you sure you want to reset the database? (type 'yes' to confirm): " confirm

    if [ "$confirm" != "yes" ]; then
        echo "Reset cancelled"
        return
    fi

    echo ""
    echo "🔄 Resetting database..."
    npx prisma migrate reset --force

    echo -e "${GREEN}✅ Database reset complete${NC}"
}

# Function to generate Prisma Client
generate_client() {
    echo ""
    echo "🔄 Generating Prisma Client..."
    npx prisma generate

    echo -e "${GREEN}✅ Prisma Client generated${NC}"
}

# Function to run seed
run_seed() {
    echo ""
    echo "🌱 Running seed..."
    npm run db:seed

    echo -e "${GREEN}✅ Seed completed${NC}"
}

# Function to open Prisma Studio
open_studio() {
    echo ""
    echo "📊 Opening Prisma Studio..."
    echo "Studio will open at http://localhost:5555"
    npx prisma studio
}

# Function to check for drift
check_drift() {
    echo ""
    echo "🔍 Checking for migration drift..."

    if npx prisma migrate diff \
        --from-schema-datamodel prisma/schema.prisma \
        --to-schema-datasource prisma/schema.prisma \
        --exit-code; then
        echo -e "${GREEN}✅ No drift detected${NC}"
    else
        echo -e "${RED}⚠️  Drift detected!${NC}"
        echo ""
        echo "This means your database schema is out of sync with your Prisma schema."
        echo "You may need to:"
        echo "  1. Create a new migration: npm run db:migrate"
        echo "  2. Or reset the database: npm run db:reset (⚠️  DESTRUCTIVE)"
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Select option (1-9): " choice

    case $choice in
        1)
            create_migration
            ;;
        2)
            check_status
            ;;
        3)
            apply_migrations
            ;;
        4)
            reset_database
            ;;
        5)
            generate_client
            ;;
        6)
            run_seed
            ;;
        7)
            open_studio
            ;;
        8)
            check_drift
            ;;
        9)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            ;;
    esac

    echo ""
    read -p "Press Enter to continue..."
    clear
done

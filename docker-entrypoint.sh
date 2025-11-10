#!/bin/sh
set -e  # Exit on any error

echo "🚀 Starting YYD Backend..."

# Run migrations (will fail if migration fails)
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Run seeds (optional - can fail without stopping app)
echo "🌱 Running database seeds..."
npm run db:seed || {
  echo "⚠️  Seed failed, but continuing (this is normal if data already exists)"
}

echo "🎉 Starting application..."
exec "$@"

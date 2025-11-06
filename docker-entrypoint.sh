#!/bin/sh
set -e
echo "🚀 Starting YYD Backend..."
npx prisma migrate deploy || echo "Migration warning"
npm run db:seed || echo "Seed warning"
echo "🎉 Starting application..."
exec "$@"

#!/bin/sh
set -e

echo "🚀 Starting YYD Backend..."

# Function to wait for PostgreSQL
wait_for_postgres() {
  echo "⏳ Waiting for PostgreSQL to be ready..."

  max_attempts=30
  attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if npx prisma db execute --stdin <<< "SELECT 1;" >/dev/null 2>&1; then
      echo "✅ PostgreSQL is ready!"
      return 0
    fi

    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts - PostgreSQL not ready yet..."
    sleep 2
  done

  echo "❌ PostgreSQL is not ready after $max_attempts attempts"
  exit 1
}

# Wait for database
wait_for_postgres

# Run migrations
echo "🔄 Running database migrations..."
if npx prisma migrate deploy; then
  echo "✅ Migrations completed successfully!"
else
  echo "❌ Migration failed!"
  exit 1
fi

# Check if database is empty and needs seeding
echo "🔍 Checking if database needs seeding..."
result=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Role\";" 2>/dev/null || echo "0")

if echo "$result" | grep -q "0"; then
  echo "🌱 Database is empty, running seed..."
  if npm run db:seed; then
    echo "✅ Seeding completed successfully!"
  else
    echo "⚠️  Seeding failed, but continuing..."
  fi
else
  echo "✅ Database already has data, skipping seed"
fi

echo "🎉 Initialization complete! Starting application..."
echo ""

# Execute the main command
exec "$@"

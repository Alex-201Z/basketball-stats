#!/bin/sh
set -e

DB_HOST="${DATABASE_HOST:-db}"
DB_USER="${DATABASE_USER:-user}"
DB_PASS="${DATABASE_PASSWORD:-password}"
DB_NAME="${DATABASE_NAME:-basketball_stats}"
DB_PORT="${DATABASE_PORT:-3306}"
export DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "Running database migrations..."
npx prisma db push

echo "Starting application..."
exec node server.js

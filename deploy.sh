#!/bin/bash
# deploy.sh - Complete deploy script for Tourmanagement-Tool
# Usage: cd ~/Tourmanagement-Tool && bash deploy.sh

set -e

echo "=== Tourmanagement-Tool Deploy ==="

# 1. Check if PostgreSQL is running, start if needed
echo "[1/7] Checking PostgreSQL..."
if ! pg_isready -q 2>/dev/null; then
  echo "  -> Starting PostgreSQL..."
  pg_ctlcluster 16 main start
  sleep 2
fi
echo "  -> PostgreSQL is running."

# 2. Pull latest code
echo "[2/7] Pulling latest code..."
git pull origin main

# 3. Stop the running server
echo "[3/7] Stopping server..."
pkill -f "next-server" 2>/dev/null || true
sleep 2

# 4. Install dependencies
echo "[4/7] Installing dependencies..."
npm install

# 5. Prisma: generate client and push schema to DB
echo "[5/7] Updating database..."
npx prisma generate
npx prisma db push

# 6. Clean old build and rebuild
echo "[6/7] Building..."
rm -rf .next
npm run build

# 7. Start server
echo "[7/7] Starting server..."
nohup npm run start > server.log 2>&1 &
disown

echo ""
echo "=== Deploy complete! ==="
echo "Server running on http://0.0.0.0:3000"
echo "Logs: tail -f server.log"

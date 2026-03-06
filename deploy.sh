#!/bin/bash
# deploy.sh - Clean deploy script for Tourmanagement-Tool
# Run this on your server after git pull

set -e

echo "=== Tourmanagement-Tool Deploy ==="

# 1. Stop the running server
echo "[1/5] Stopping server..."
pkill -f "next-server" 2>/dev/null || true
sleep 2

# 2. Install dependencies (also runs prisma generate via postinstall)
echo "[2/5] Installing dependencies..."
npm install

# 3. Clean old build completely
echo "[3/5] Cleaning old build..."
rm -rf .next

# 4. Build
echo "[4/5] Building..."
npm run build

# 5. Start server
echo "[5/5] Starting server..."
nohup npm run start > server.log 2>&1 &
disown

echo ""
echo "=== Deploy complete! ==="
echo "Server running on http://0.0.0.0:3000"
echo "Logs: tail -f server.log"

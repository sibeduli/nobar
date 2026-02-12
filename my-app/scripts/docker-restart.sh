#!/bin/bash

# Restart nobar app with latest code from git
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "📥 Pulling latest changes from git..."
git pull

echo "🔨 Rebuilding and restarting nobar-app..."
docker compose up -d --build

echo "✅ Restart complete!"
echo "📋 View logs with: docker compose logs -f"

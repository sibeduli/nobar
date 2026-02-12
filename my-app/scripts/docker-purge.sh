#!/bin/bash

# Purge all nobar app containers and images (ONLY this app, not others)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "🗑️  Purging nobar-app containers and images..."

# Stop and remove containers
echo "Stopping containers..."
docker compose down --remove-orphans 2>/dev/null || true

# Remove the specific image built by this project
echo "Removing images..."
docker rmi my-app-app 2>/dev/null || true
docker rmi nobar-app 2>/dev/null || true

# Remove any dangling images from this build
docker image prune -f --filter "label=com.docker.compose.project=my-app" 2>/dev/null || true

echo "✅ Purge complete!"
echo "💡 Run ./scripts/docker-build.sh to rebuild"

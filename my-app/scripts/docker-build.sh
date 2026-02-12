#!/bin/bash

# Build Docker image for nobar app
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "🔨 Building nobar-app Docker image..."
docker compose build --no-cache

echo "✅ Build complete!"

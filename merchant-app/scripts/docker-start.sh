#!/bin/bash

# Start nobar app containers
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "🚀 Starting nobar-app..."
docker compose up -d

echo "✅ App started! Access at http://localhost:3000"
echo "📋 View logs with: docker compose logs -f"

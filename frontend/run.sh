#!/usr/bin/env bash
set -e

echo "Starting Pulse frontend (Linux/macOS)..."

if [ ! -d "node_modules" ]; then
    echo "node_modules not found, running npm install first..."
    npm install
fi

npm run dev -- --host
#!/usr/bin/env bash
set -e

echo "Starting Pulse backend (Linux/macOS)..."

if [ "$EUID" -ne 0 ]; then
    echo "WARNING: Not running as root."
    echo "Packet capture and device discovery will fail without it."
    echo "Re-run with: sudo ./run.sh"
    echo ""
fi

uv run uvicorn pulse.main:app --host 0.0.0.0 --port 8001 --reload
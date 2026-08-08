#!/usr/bin/env bash
set -e

echo "Starting Pulse backend (Linux/macOS)..."

if [ "$EUID" -ne 0 ]; then
    echo "WARNING: Not running as root."
    echo "Packet capture and device discovery will fail without it."
    echo "Re-run with: sudo ./run.sh"
    echo ""
fi

# Find uv even if it's not on the current PATH (common when run under sudo,
# since uv is typically installed per-user, not system-wide)
UV_BIN=$(command -v uv || true)
if [ -z "$UV_BIN" ]; then
    if [ -x "$HOME/.local/bin/uv" ]; then
        UV_BIN="$HOME/.local/bin/uv"
    elif [ -x "/root/.local/bin/uv" ]; then
        UV_BIN="/root/.local/bin/uv"
    fi
fi

if [ -z "$UV_BIN" ]; then
    echo "ERROR: could not find the 'uv' executable."
    echo "Install it with: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

"$UV_BIN" run uvicorn pulse.main:app --host 0.0.0.0 --port 8001 --reload

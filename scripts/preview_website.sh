#!/bin/bash
set -euo pipefail

PORT="${PORT:-8080}"
ROOT="${ROOT:-website}"
URL="http://localhost:${PORT}/index.html"

if curl -fsS "$URL" >/dev/null 2>&1; then
  echo "Preview already running at $URL"
  exit 0
fi

cd "$(dirname "$0")/.."
python3 -m http.server "$PORT" --directory "$ROOT"

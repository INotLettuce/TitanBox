#!/bin/bash
set -euo pipefail

PORT="${PORT:-8080}"
ROOT="${ROOT:-website}"
URL="http://localhost:${PORT}/index.html"

if ! command -v inotifywait >/dev/null 2>&1; then
  echo "inotifywait not found; starting plain preview server instead."
  exec python3 -m http.server "$PORT" --directory "$ROOT"
fi

cd "$(dirname "$0")/.."
if curl -fsS "$URL" >/dev/null 2>&1; then
  echo "Preview already running at $URL"
  echo "Watching for changes in $ROOT..."
else
  python3 -m http.server "$PORT" --directory "$ROOT" >/tmp/titanbox_preview.log 2>&1 &
  SERVER_PID=$!
  echo "Preview server started at $URL"
  trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true; exit 0' INT TERM EXIT
fi

while true; do
  inotifywait -r -q -e close_write,create,delete,move "$ROOT" >/dev/null 2>&1 || true
  echo "Change detected in $ROOT. Refresh the browser to see the update."
done

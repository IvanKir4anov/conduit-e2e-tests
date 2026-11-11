#!/usr/bin/env bash
# Polls the API until it answers, so tests never start against a half-started stack.
set -euo pipefail
cd "$(dirname "$0")/.."

url="${API_URL:-http://localhost:8080/api}/tags"
timeout="${WAIT_TIMEOUT:-120}"
deadline=$((SECONDS + timeout))

until curl -fs -o /dev/null "$url"; do
  if (( SECONDS >= deadline )); then
    echo "Application did not become ready within ${timeout}s ($url)" >&2
    docker compose logs --tail=100 >&2 || true
    exit 1
  fi
  sleep 2
done
echo "Application is ready: $url"

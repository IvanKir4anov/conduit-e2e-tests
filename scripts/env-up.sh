#!/usr/bin/env bash
# Starts the application under test and waits until it is ready.
set -euo pipefail
cd "$(dirname "$0")/.."

# The JWT signing key is created once per local environment and reused on every start,
# so tokens issued earlier stay valid. `npm run env:reset` keeps it; delete .env to rotate.
if [[ ! -f .env ]]; then
  umask 077
  printf 'Jwt__SigningKey=%s\n' "$(openssl rand -base64 32)" > .env
  echo "Created .env with a new JWT signing key"
fi

docker compose up -d --build
bash scripts/wait-for-app.sh

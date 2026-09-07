#!/usr/bin/env bash
set -Eeuo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

command -v docker >/dev/null || { echo 'Docker is required.'; exit 1; }
docker compose version >/dev/null 2>&1 || { echo 'Docker Compose v2 is required.'; exit 1; }

ENV_FILE="$ROOT_DIR/.env"
if [[ ! -f "$ENV_FILE" ]]; then cp "$ROOT_DIR/.env.example" "$ENV_FILE"; fi

set_env() {
  local key="$1" value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s#^${key}=.*#${key}=${value}#" "$ENV_FILE"
  else
    printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
  fi
}

current_jwt="$(grep '^JWT_SECRET=' "$ENV_FILE" | cut -d= -f2- || true)"
if [[ -z "$current_jwt" || "$current_jwt" =~ ^(your-|change-|replace-|dev-) ]]; then
  JWT_SECRET="$(openssl rand -base64 64 2>/dev/null | tr -d '\n' || head -c 64 /dev/urandom | base64 | tr -d '\n')"
  set_env JWT_SECRET "$JWT_SECRET"
  echo 'Generated a unique JWT secret.'
fi

current_admin="$(grep '^NEXORA_ADMIN_PASSWORD=' "$ENV_FILE" | cut -d= -f2- || true)"
if [[ -z "$current_admin" ]]; then
  ADMIN_PASSWORD="$(openssl rand -base64 24 2>/dev/null | tr -d '\n' || head -c 32 /dev/urandom | base64 | tr -d '\n')"
  set_env NEXORA_ADMIN_PASSWORD "$ADMIN_PASSWORD"
  echo 'Generated a unique initial admin password.'
fi

chmod 600 "$ENV_FILE"

docker compose --env-file "$ENV_FILE" -f docker-compose.prod.yml up -d --build

echo
echo 'Nexora deployment started.'
echo "Web:     ${FRONTEND_URL:-http://localhost}"
echo 'Health:  /health'
echo 'Initial admin email: admin@nexora.com'
echo 'The generated initial admin password is stored in the protected .env file.'
echo 'IMPORTANT: change the initial admin password after first login.'

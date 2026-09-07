#!/usr/bin/env bash
set -Eeuo pipefail

# Nexora one-command installer. It uses Docker so host-language dependencies are not required.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

say(){ printf '\n[NEXORA] %s\n' "$*"; }
fail(){ echo "[NEXORA] ERROR: $*" >&2; exit 1; }

[[ "$(uname -s)" == "Linux" ]] || fail "This installer is for Linux."
command -v docker >/dev/null 2>&1 || fail "Docker is required. Install Docker Engine and run this installer again."
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required."

ENV_FILE="$ROOT_DIR/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  cp "$ROOT_DIR/.env.example" "$ENV_FILE"
fi

random_secret(){
  if command -v openssl >/dev/null 2>&1; then openssl rand -base64 "$1" | tr -d '\n'; else head -c "$(( $1 * 2 ))" /dev/urandom | base64 | tr -d '\n'; fi
}
set_env(){
  local key="$1" value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then sed -i "s#^${key}=.*#${key}=${value}#" "$ENV_FILE"; else printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"; fi
}

jwt="$(grep '^JWT_SECRET=' "$ENV_FILE" | cut -d= -f2- || true)"
if [[ -z "$jwt" || "$jwt" =~ ^(your-|change-|replace-|dev-) ]]; then set_env JWT_SECRET "$(random_secret 64)"; say "Generated unique JWT secret."; fi

admin="$(grep '^NEXORA_ADMIN_PASSWORD=' "$ENV_FILE" | cut -d= -f2- || true)"
if [[ -z "$admin" ]]; then admin="$(random_secret 24)"; set_env NEXORA_ADMIN_PASSWORD "$admin"; say "Generated initial admin password."; fi

chmod 600 "$ENV_FILE"
say "Building Nexora images and installing dependencies automatically..."
docker compose --env-file "$ENV_FILE" -f docker-compose.prod.yml up -d --build

say "Waiting for Nexora backend..."
for _ in {1..60}; do
  if curl -fsS http://127.0.0.1:8080/health >/dev/null 2>&1; then break; fi
  sleep 2
done

if ! curl -fsS http://127.0.0.1:8080/health >/dev/null 2>&1; then
  docker compose --env-file "$ENV_FILE" -f docker-compose.prod.yml ps
  fail "Nexora did not become healthy. Run: docker compose -f docker-compose.prod.yml logs --tail=200 backend"
fi

say "Nexora installation completed successfully."
echo "Web: http://$(hostname -I | awk '{print $1}')"
echo "Admin: admin@nexora.com"
echo "Initial password: $admin"
echo "Config: $ENV_FILE"

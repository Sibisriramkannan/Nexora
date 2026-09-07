#!/usr/bin/env bash
set -Eeuo pipefail
NEXORA_URL='__NEXORA_URL__'
TOKEN='__TOKEN__'
if [[ -z "$TOKEN" ]]; then read -r -p 'Nexora enrollment token: ' TOKEN; fi
[[ $(id -u) -eq 0 ]] || { echo 'Run with sudo/root.'; exit 1; }
command -v curl >/dev/null || { echo 'curl is required.'; exit 1; }
INSTALL_DIR='/opt/nexora-agent'; CONFIG_DIR='/etc/nexora-agent'
mkdir -p "$INSTALL_DIR" "$CONFIG_DIR"
ARCH=$(uname -m); case "$ARCH" in x86_64|amd64) ARCH=x64;; aarch64|arm64) ARCH=arm64;; *) echo "Unsupported architecture: $ARCH"; exit 1;; esac
HOST=$(hostname); PRIVATE=$(hostname -I 2>/dev/null | awk '{print $1}'); OSV=$( . /etc/os-release 2>/dev/null; echo "${PRETTY_NAME:-Linux}" )
BODY=$(python3 - "$HOST" "$OSV" "$PRIVATE" "$ARCH" <<'PY'
import json,sys
print(json.dumps({'server_id':sys.argv[1],'hostname':sys.argv[1],'os':'Linux','os_version':sys.argv[2],'private_ip':sys.argv[3],'architecture':sys.argv[4],'version':'1.0.0'}))
PY
)
RESP=$(curl -fsS -X POST "$NEXORA_URL/api/agent-enrollment/register/$TOKEN" -H 'Content-Type: application/json' -d "$BODY")
API=$(python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["api_key"])' <<<"$RESP")
SID=$(python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["server_id"])' <<<"$RESP")
cat > "$CONFIG_DIR/agent.env" <<CFG
NEXORA_URL=$NEXORA_URL
NEXORA_API_KEY=$API
NEXORA_SERVER_ID=$SID
CFG
chmod 600 "$CONFIG_DIR/agent.env"
cat > "$INSTALL_DIR/agent.sh" <<'AGENT'
#!/usr/bin/env bash
set -Eeuo pipefail
source /etc/nexora-agent/agent.env
while true; do
  CPU=$(awk 'NR==1 {t=$2+$3+$4+$5+$6+$7+$8; if(t>0) printf "%.2f", ($2+$4)*100/t}' /proc/stat)
  MEM=$(free | awk '/Mem:/ {printf "%.2f", $3/$2*100}')
  DISK=$(df / | awk 'NR==2 {gsub(/%/,"",$5); print $5}')
  UPTIME=$(cut -d. -f1 /proc/uptime)
  curl -fsS -X POST "$NEXORA_URL/api/agents/linux/metrics" -H 'Content-Type: application/json' -H "X-API-Key: $NEXORA_API_KEY" -H "X-Server-ID: $NEXORA_SERVER_ID" -d "{\"cpu\":$CPU,\"memory\":$MEM,\"disk\":$DISK,\"uptime\":$UPTIME,\"timestamp\":$(date +%s)}" >/dev/null || true
  sleep 30
done
AGENT
chmod 700 "$INSTALL_DIR/agent.sh"
cat > /etc/systemd/system/nexora-agent.service <<UNIT
[Unit]
Description=Nexora Monitoring Agent
After=network-online.target
Wants=network-online.target
[Service]
Type=simple
ExecStart=$INSTALL_DIR/agent.sh
Restart=always
RestartSec=5
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$CONFIG_DIR
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now nexora-agent.service
echo 'NEXORA_AGENT_CONNECTED'

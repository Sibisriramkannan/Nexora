#!/bin/bash

# ============================================
# Nexora Agent Installer for Linux
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Nexora Agent Installation${NC}"
echo "================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root${NC}"
    exit 1
fi

# ==================== PARSE ARGUMENTS ====================

SERVER_ID=${SERVER_ID:-$(hostname)}
MAIN_SERVER=${MAIN_SERVER:-"https://nexora.yourdomain.com"}
API_KEY=${API_KEY:-""}
INTERVAL=${INTERVAL:-30}

while [[ $# -gt 0 ]]; do
    case $1 in
        --server-id=*)
            SERVER_ID="${1#*=}"
            shift
            ;;
        --main-server=*)
            MAIN_SERVER="${1#*=}"
            shift
            ;;
        --api-key=*)
            API_KEY="${1#*=}"
            shift
            ;;
        --interval=*)
            INTERVAL="${1#*=}"
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --server-id=ID     Server ID (default: hostname)"
            echo "  --main-server=URL  Main server URL"
            echo "  --api-key=KEY      API key (required)"
            echo "  --interval=N       Collection interval in seconds"
            echo "  --help             Show this help"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Validate API key
if [ -z "$API_KEY" ]; then
    echo -e "${RED}❌ API_KEY is required${NC}"
    echo "Usage: $0 --api-key=YOUR_API_KEY"
    exit 1
fi

echo -e "${GREEN}📋 Installation Parameters:${NC}"
echo "  Server ID: $SERVER_ID"
echo "  Main Server: $MAIN_SERVER"
echo "  API Key: ${API_KEY:0:8}..."
echo "  Interval: $INTERVAL seconds"

# ==================== CREATE DIRECTORIES ====================

echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p /opt/nexora
mkdir -p /etc/nexora
mkdir -p /var/log/nexora
mkdir -p /var/lib/nexora

# ==================== DOWNLOAD AGENT ====================

echo -e "${BLUE}📥 Downloading agent...${NC}"

# Try to download from main server
if curl -L -o /opt/nexora/agent "$MAIN_SERVER/api/agents/linux/download" 2>/dev/null; then
    echo -e "${GREEN}✅ Agent downloaded from main server${NC}"
else
    echo -e "${YELLOW}⚠️ Could not download from main server, building from source...${NC}"
    
    # Check if Go is installed
    if ! command -v go &> /dev/null; then
        echo -e "${YELLOW}📦 Installing Go...${NC}"
        wget -q https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
        tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
        rm go1.21.5.linux-amd64.tar.gz
        export PATH=$PATH:/usr/local/go/bin
    fi
    
    # Build agent from source
    echo -e "${BLUE}🔨 Building agent from source...${NC}"
    cd /opt/nexora
    cat > agent.go << 'EOF'
# (Place agent.go content here - or use pre-built binary)
EOF
    go mod init nexora-agent
    go mod tidy
    go build -o agent agent.go
fi

# Make executable
chmod +x /opt/nexora/agent

# ==================== CREATE CONFIGURATION ====================

echo -e "${BLUE}⚙️ Creating configuration...${NC}"

cat > /etc/nexora/agent.yaml << EOF
server_id: $SERVER_ID
main_server: $MAIN_SERVER
api_key: $API_KEY
interval: $INTERVAL
log_level: info
EOF

# ==================== CREATE SYSTEMD SERVICE ====================

echo -e "${BLUE}🔄 Creating systemd service...${NC}"

cat > /etc/systemd/system/nexora-agent.service << 'EOF'
[Unit]
Description=Nexora Monitoring Agent
Documentation=https://nexora.yourdomain.com/docs
After=network.target
Wants=network.target

[Service]
Type=simple
User=nobody
Group=nogroup
Environment="CONFIG_PATH=/etc/nexora/agent.yaml"
ExecStart=/opt/nexora/agent
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=10
StartLimitBurst=5
StartLimitInterval=60
ProtectSystem=full
ProtectHome=true
NoNewPrivileges=true
PrivateTmp=true
MemoryMax=100M
CPUQuota=10%

[Install]
WantedBy=multi-user.target
EOF

# ==================== SETUP LOGROTATE ====================

echo -e "${BLUE}📊 Setting up log rotation...${NC}"

cat > /etc/logrotate.d/nexora-agent << 'EOF'
/var/log/nexora/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 nobody nogroup
    postrotate
        systemctl reload nexora-agent > /dev/null 2>&1 || true
    endscript
}
EOF

# ==================== START AGENT ====================

echo -e "${BLUE}🚀 Starting agent...${NC}"

systemctl daemon-reload
systemctl enable nexora-agent
systemctl start nexora-agent

# Check status
if systemctl is-active --quiet nexora-agent; then
    echo -e "${GREEN}✅ Agent started successfully${NC}"
else
    echo -e "${RED}❌ Agent failed to start${NC}"
    systemctl status nexora-agent --no-pager
    exit 1
fi

# ==================== SUMMARY ====================

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo "========================================"
echo -e "📊 ${BLUE}Agent Status:${NC}"
systemctl status nexora-agent --no-pager
echo ""
echo -e "📋 ${BLUE}Useful Commands:${NC}"
echo "  - View logs: journalctl -u nexora-agent -f"
echo "  - Restart:   systemctl restart nexora-agent"
echo "  - Stop:      systemctl stop nexora-agent"
echo "  - Status:    systemctl status nexora-agent"
echo ""
echo -e "📁 ${BLUE}Files:${NC}"
echo "  - Binary:    /opt/nexora/agent"
echo "  - Config:    /etc/nexora/agent.yaml"
echo "  - Logs:      /var/log/nexora/"
echo ""
echo -e "${BLUE}🔗 Agent connected to: $MAIN_SERVER${NC}"
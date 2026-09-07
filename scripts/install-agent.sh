#!/bin/bash

# Nexora Agent Installation Script
# Usage: ./install-agent.sh --server-id=<id> --main-server=<url> --api-key=<key>

set -e

echo "🚀 Nexora Agent Installation"
echo "============================="

# Parse arguments
for arg in "$@"; do
    case $arg in
        --server-id=*)
            SERVER_ID="${arg#*=}"
            ;;
        --main-server=*)
            MAIN_SERVER="${arg#*=}"
            ;;
        --api-key=*)
            API_KEY="${arg#*=}"
            ;;
        *)
            echo "Unknown argument: $arg"
            exit 1
            ;;
    esac
done

# Check required arguments
if [ -z "$SERVER_ID" ] || [ -z "$MAIN_SERVER" ] || [ -z "$API_KEY" ]; then
    echo "❌ Missing required arguments"
    echo "Usage: ./install-agent.sh --server-id=<id> --main-server=<url> --api-key=<key>"
    exit 1
fi

echo "📋 Installation Parameters:"
echo "  Server ID: $SERVER_ID"
echo "  Main Server: $MAIN_SERVER"
echo "  API Key: $API_KEY"

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="darwin"
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
else
    echo "❌ Unsupported OS: $OSTYPE"
    exit 1
fi

echo "🖥️ Detected OS: $OS"

# Download agent
echo "📥 Downloading agent..."
AGENT_URL="$MAIN_SERVER/agents/$OS/agent"
AGENT_PATH="/usr/local/bin/nexora-agent"

if [ "$OS" == "windows" ]; then
    AGENT_PATH="C:\\Program Files\\Nexora\\agent.exe"
    curl -L -o "$AGENT_PATH" "$AGENT_URL"
else
    curl -L -o "$AGENT_PATH" "$AGENT_URL"
    chmod +x "$AGENT_PATH"
fi

# Create config
echo "⚙️ Creating configuration..."
CONFIG_PATH="/etc/nexora/agent.yaml"
mkdir -p /etc/nexora

cat > "$CONFIG_PATH" << EOF
server_id: $SERVER_ID
main_server: $MAIN_SERVER
api_key: $API_KEY
interval: 30
EOF

# Create systemd service (Linux)
if [ "$OS" == "linux" ]; then
    echo "🔄 Creating systemd service..."
    cat > /etc/systemd/system/nexora-agent.service << EOF
[Unit]
Description=Nexora Monitoring Agent
After=network.target

[Service]
Type=simple
User=nobody
Group=nogroup
EnvironmentFile=/etc/nexora/agent.env
ExecStart=$AGENT_PATH -config $CONFIG_PATH
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable nexora-agent
    systemctl start nexora-agent
    
    echo "✅ Agent started successfully"
    systemctl status nexora-agent
fi

echo "✅ Installation complete!"
echo "📊 Agent running in background"
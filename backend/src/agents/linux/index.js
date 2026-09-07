const express = require('express');
const router = express.Router();
const agentManager = require('../agentManager');
const logger = require('../../utils/logger');

// ✅ FIX 7: Correct API paths - /register and /metrics

// Register agent
router.post('/register', async (req, res) => {
    try {
        const { server_id, hostname, os, os_version, ip, version } = req.body;

        if (!server_id) {
            return res.status(400).json({
                success: false,
                message: 'server_id is required'
            });
        }

        // ✅ FIX 9: Store API key in Server model
        const server = await agentManager.registerAgent({
            server_id,
            hostname: hostname || server_id,
            os: os || 'Linux',
            os_version: os_version || 'Unknown',
            ip: ip || req.ip || 'unknown',
            version: version || '1.0.0'
        });

        res.status(200).json({
            success: true,
            message: 'Agent registered successfully',
            data: {
                server_id: server_id,
                api_key: server.api_key,
                config: {
                    server_id: server_id,
                    main_server: `${req.protocol}://${req.get('host')}`,
                    interval: 30
                }
            }
        });
    } catch (error) {
        logger.error('Linux agent registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register agent',
            error: error.message
        });
    }
});

// ✅ FIX 8: Validate API key properly
router.post('/metrics', async (req, res) => {
    try {
        const metrics = req.body;
        const apiKey = req.headers['x-api-key'];
        const serverId = req.headers['x-server-id'];

        if (!apiKey || !serverId) {
            return res.status(401).json({
                success: false,
                message: 'API key and server ID required'
            });
        }

        // ✅ FIX 8: Validate API key belongs to server
        const isValid = await agentManager.validateApiKey(serverId, apiKey);
        if (!isValid) {
            return res.status(403).json({
                success: false,
                message: 'Invalid API key'
            });
        }

        // ✅ FIX 24: Fix zero value validation
        if (metrics.cpu === undefined || metrics.memory === undefined || metrics.disk === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Incomplete metrics data'
            });
        }

        await agentManager.processMetrics({
            ...metrics,
            server_id: serverId,
            timestamp: metrics.timestamp || Math.floor(Date.now() / 1000)
        });

        res.status(200).json({
            success: true,
            message: 'Metrics received',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Linux metrics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process metrics',
            error: error.message
        });
    }
});

// ✅ FIX 5: Correct download path
router.get('/download', (req, res) => {
    try {
        // Serve agent binary
        const binary = generateAgentBinary();
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename=nexora-agent');
        res.send(binary);
    } catch (error) {
        logger.error('Agent download error:', error);
        res.status(500).send('Failed to download agent');
    }
});

// ✅ FIX 5: Correct install script path
router.get('/install.sh', (req, res) => {
    try {
        const apiKey = req.query.api_key;
        const mainServer = req.query.main_server || `${req.protocol}://${req.get('host')}`;
        const serverId = req.query.server_id || 'auto';

        const script = generateInstallScript(apiKey, mainServer, serverId);
        res.setHeader('Content-Type', 'text/plain');
        res.send(script);
    } catch (error) {
        logger.error('Install script error:', error);
        res.status(500).send('Failed to generate install script');
    }
});

// ✅ FIX 24: Generate install script with correct paths
function generateInstallScript(apiKey, mainServer, serverId) {
    return `#!/bin/bash
# Nexora Linux Agent Installation Script

set -e

SERVER_ID="${serverId}"
MAIN_SERVER="${mainServer}"
API_KEY="${apiKey}"

mkdir -p /opt/nexora /etc/nexora /var/log/nexora

# ✅ FIX 7: Correct API path
curl -L -o /opt/nexora/agent "\${MAIN_SERVER}/api/agents/linux/download"

chmod +x /opt/nexora/agent

cat > /etc/nexora/agent.yaml << EOF
server_id: \${SERVER_ID}
main_server: \${MAIN_SERVER}
api_key: \${API_KEY}
interval: 30
EOF

cat > /etc/systemd/system/nexora-agent.service << 'EOF'
[Unit]
Description=Nexora Agent
After=network.target

[Service]
Type=simple
User=nobody
Group=nogroup
ExecStart=/opt/nexora/agent
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable nexora-agent
systemctl start nexora-agent

echo "✅ Agent installed successfully!"
`;
}

function generateAgentBinary() {
    return `#!/bin/bash
# Nexora Linux Agent
CONFIG_FILE="/etc/nexora/agent.yaml"
read_config() { awk -F': ' -v key="$1" '$1 == key {print $2}' "$CONFIG_FILE" 2>/dev/null | head -n1; }
MAIN_SERVER="$(read_config main_server)"
API_KEY="$(read_config api_key)"
SERVER_ID="$(read_config server_id)"
INTERVAL="$(read_config interval)"
MAIN_SERVER="\${MAIN_SERVER%/}"
INTERVAL="\${INTERVAL:-30}"
if [ -z "$MAIN_SERVER" ] || [ -z "$API_KEY" ] || [ -z "$SERVER_ID" ]; then
  echo "Nexora agent configuration is incomplete: $CONFIG_FILE" >&2
  exit 1
fi
while true; do
    CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    MEM=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
    DISK=$(df -h / | awk 'NR==2{print $5}' | cut -d'%' -f1)
    
    # ✅ FIX 7: Correct API path
    curl -X POST "\${MAIN_SERVER}/api/agents/linux/metrics" \\
        -H "Content-Type: application/json" \\
        -H "X-API-Key: \${API_KEY}" \\
        -H "X-Server-ID: \${SERVER_ID}" \\
        -d "{\\"cpu\\": \\\${CPU}, \\"memory\\": \\\${MEM}, \\"disk\\": \\\${DISK}}"
    
    sleep "\${INTERVAL}"
done
`;
}

module.exports = router;
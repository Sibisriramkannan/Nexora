const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const Server = require('../models/Server');
const Monitor = require('../models/Monitor');
const Alert = require('../models/Alert');

class AgentManager {
    constructor() {
        this.agents = new Map();
        this.heartbeatInterval = 30000;
        this.timeoutThreshold = 90000;
    }

    // ✅ FIX 8: Validate API key
    async validateApiKey(serverId, apiKey) {
        try {
            const server = await Server.findOne({ 
                where: { name: serverId, api_key: apiKey }
            });
            return !!server;
        } catch (error) {
            logger.error('API key validation error:', error);
            return false;
        }
    }

    // ✅ FIX 9: Store API key in Server model
    async registerAgent(agentData) {
        try {
            const { server_id, hostname, os, os_version, ip, version } = agentData;

            let server = await Server.findOne({ where: { name: server_id } });

            if (server) {
                const apiKey = server.api_key || `nexora_${uuidv4().replace(/-/g, '')}`;
                await server.update({
                    hostname: hostname,
                    ip_address: ip,
                    os: os,
                    last_seen: new Date(),
                    agent_installed: true,
                    agent_version: version,
                    status: 'online',
                    api_key: apiKey
                });
                logger.info(`✅ Agent updated for server: ${server_id}`);
            } else {
                // ✅ FIX 9: Generate and store API key
                const apiKey = `nexora_${uuidv4().replace(/-/g, '')}`;
                server = await Server.create({
                    id: uuidv4(),
                    name: server_id,
                    hostname: hostname,
                    ip_address: ip,
                    os: os,
                    agent_installed: true,
                    agent_version: version,
                    status: 'online',
                    api_key: apiKey,  // ✅ FIX 9: Store API key
                    last_seen: new Date(),
                });
                logger.info(`✅ New agent registered: ${server_id}`);

                await this.createDefaultMonitors(server);
            }

            this.agents.set(server_id, {
                server_id,
                last_seen: Date.now(),
                status: 'online',
                version: version,
                os: os,
                hostname: hostname
            });

            return server;
        } catch (error) {
            logger.error('Agent registration error:', error);
            throw error;
        }
    }

    // ✅ FIX 10 & 11: Use valid enum values
    async createDefaultMonitors(server) {
        const monitors = [
            {
                id: uuidv4(),
                name: `${server.name} - CPU`,
                type: 'system',  // ✅ FIX 10: Valid enum
                target: server.ip_address,
                interval: 60,
                server_id: server.id,
                
                thresholds: { warning: 80, critical: 95 }
            },
            {
                id: uuidv4(),
                name: `${server.name} - Memory`,
                type: 'system',  // ✅ FIX 10: Valid enum
                target: server.ip_address,
                interval: 60,
                server_id: server.id,
                
                thresholds: { warning: 80, critical: 95 }
            },
            {
                id: uuidv4(),
                name: `${server.name} - Disk`,
                type: 'system',  // ✅ FIX 10: Valid enum
                target: server.ip_address,
                interval: 60,
                server_id: server.id,
                
                thresholds: { warning: 80, critical: 95 }
            }
        ];

        for (const monitorData of monitors) {
            await Monitor.create(monitorData);
        }
        logger.info(`✅ Created ${monitors.length} monitors for server: ${server.name}`);
    }

    // ✅ FIX 11: Use valid enum value
    async createAlert(server, severity, message) {
        const existing = await Alert.findOne({
            where: {
                server_id: server.id,
                severity: severity,
                status: ['triggered', 'acknowledged'],
                message: message
            }
        });

        if (!existing) {
            await Alert.create({
                id: uuidv4(),
                severity: severity,
                status: 'triggered',
                source_type: 'agent',  // ✅ FIX 11: Valid enum
                source_id: server.id,
                server_id: server.id,
                message: message,
                triggered_at: new Date()
            });
            logger.info(`🚨 Alert created: ${severity} - ${message}`);
        }
    }

    async storeMetrics(metrics) {
        await this.storeMetricsPostgres(metrics);
    }

    async storeMetricsPostgres(metrics) {
        try {
            const Metric = require('../models/Metric');
            await Metric.create({
                server_id: metrics.server_id,
                cpu: metrics.cpu,
                memory: metrics.memory,
                disk: metrics.disk,
                process_count: metrics.process_count || 0,
                uptime: metrics.uptime || null,
                timestamp: new Date(metrics.timestamp * 1000)
            });
        } catch (error) {
            logger.error('Error storing metrics in PostgreSQL:', error);
        }
    }

    async processMetrics(metrics) {
        const server = await Server.findOne({ where: { name: metrics.server_id } });
        if (!server) throw new Error(`Server not found: ${metrics.server_id}`);

        const cpu = Number(metrics.cpu) || 0;
        const memory = Number(metrics.memory) || 0;
        const disk = Number(metrics.disk) || 0;

        await server.update({
            cpu_usage: cpu,
            memory_usage: memory,
            disk_usage: disk,
            uptime: metrics.uptime != null ? Number(metrics.uptime) : server.uptime,
            last_seen: new Date(),
            status: 'online',
            agent_installed: true
        });

        const agent = this.agents.get(metrics.server_id) || { server_id: metrics.server_id };
        agent.last_seen = Date.now();
        agent.status = 'online';
        this.agents.set(metrics.server_id, agent);

        await this.storeMetrics(metrics);

        if (cpu >= 95) await this.createAlert(server, 'critical', `CPU usage is ${cpu.toFixed(1)}%`);
        else if (cpu >= 80) await this.createAlert(server, 'warning', `CPU usage is ${cpu.toFixed(1)}%`);
        if (memory >= 95) await this.createAlert(server, 'critical', `Memory usage is ${memory.toFixed(1)}%`);
        else if (memory >= 80) await this.createAlert(server, 'warning', `Memory usage is ${memory.toFixed(1)}%`);
        if (disk >= 95) await this.createAlert(server, 'critical', `Disk usage is ${disk.toFixed(1)}%`);
        else if (disk >= 90) await this.createAlert(server, 'warning', `Disk usage is ${disk.toFixed(1)}%`);

        return { server_id: metrics.server_id, cpu, memory, disk, timestamp: metrics.timestamp };
    }

    getAgentStatus(serverId) {
        const agent = this.agents.get(serverId);
        if (!agent) return null;
        return { ...agent, last_seen: new Date(agent.last_seen).toISOString() };
    }

    getAllAgents() {
        return Array.from(this.agents.values()).map(agent => ({ ...agent, last_seen: new Date(agent.last_seen).toISOString() }));
    }

    startHeartbeatChecker() {
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(async () => {
            const now = Date.now();
            for (const [serverId, agent] of this.agents.entries()) {
                if (now - agent.last_seen > this.timeoutThreshold && agent.status !== 'offline') {
                    agent.status = 'offline';
                    try {
                        await Server.update({ status: 'offline' }, { where: { name: serverId } });
                    } catch (error) {
                        logger.error(`Failed to mark agent ${serverId} offline:`, error);
                    }
                }
            }
        }, this.heartbeatInterval);
        this.heartbeatTimer.unref?.();
    }

    // ... rest of existing code
}

// Export singleton
const agentManager = new AgentManager();
module.exports = agentManager;
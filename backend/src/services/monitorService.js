const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { exec } = require('child_process');
const net = require('net');
const dns = require('dns');
const logger = require('../utils/logger');
const Monitor = require('../models/Monitor');
const Alert = require('../models/Alert');
const alertService = require('./alertService');

class MonitorService {
    constructor() {
        this.monitors = new Map();
        this.checkInterval = 60000; // 1 minute
        this.isRunning = false;
    }

    // Start monitoring
    async start() {
        if (this.isRunning) return;
        this.isRunning = true;

        logger.info('🔄 Monitor service started');

        // Initial load
        await this.loadMonitors();

        // Start checking loop
        this.checkLoop();
    }

    // Stop monitoring
    stop() {
        this.isRunning = false;
        logger.info('🛑 Monitor service stopped');
    }

    // Load monitors from database
    async loadMonitors() {
        try {
            const monitors = await Monitor.findAll({
                where: { status: ['up', 'down', 'warning', 'unknown'] }
            });

            for (const monitor of monitors) {
                this.monitors.set(monitor.id, {
                    ...monitor.toJSON(),
                    lastCheck: null,
                    failCount: 0,
                    successCount: 0
                });
            }

            logger.info(`✅ Loaded ${monitors.length} monitors`);
        } catch (error) {
            logger.error('❌ Load monitors error:', error);
        }
    }

    // Main check loop
    async checkLoop() {
        while (this.isRunning) {
            try {
                await this.checkAllMonitors();
            } catch (error) {
                logger.error('❌ Monitor check error:', error);
            }

            // Wait for next interval
            await new Promise(resolve => setTimeout(resolve, this.checkInterval));
        }
    }

    // Check all monitors
    async checkAllMonitors() {
        for (const [id, monitor] of this.monitors) {
            try {
                await this.checkMonitor(id);
            } catch (error) {
                logger.error(`❌ Error checking monitor ${id}:`, error);
            }
        }
    }

    // Check single monitor
    async checkMonitor(monitorId) {
        const monitor = this.monitors.get(monitorId);
        if (!monitor) return;

        const start = Date.now();

        try {
            let result;
            switch (monitor.type) {
                case 'http':
                case 'https':
                    result = await this.checkHTTP(monitor);
                    break;
                case 'ping':
                    result = await this.checkPing(monitor);
                    break;
                case 'tcp':
                    result = await this.checkTCP(monitor);
                    break;
                case 'dns':
                    result = await this.checkDNS(monitor);
                    break;
                default:
                    throw new Error(`Unknown monitor type: ${monitor.type}`);
            }

            const responseTime = Date.now() - start;

            // Update monitor status
            await this.updateMonitorStatus(monitorId, result, responseTime);

        } catch (error) {
            const responseTime = Date.now() - start;
            await this.updateMonitorStatus(monitorId, {
                status: 'down',
                message: error.message
            }, responseTime);
        }
    }

    // Check HTTP/HTTPS
    async checkHTTP(monitor) {
        const config = monitor.config || {};
        const method = config.method || 'GET';
        const headers = config.headers || {};
        const body = config.body || null;

        try {
            const response = await axios({
                method: method,
                url: monitor.target,
                headers: headers,
                data: body,
                timeout: (monitor.timeout || 10) * 1000,
                validateStatus: () => true
            });

            // Check status code
            const expectedStatus = config.expected_status || 200;
            if (response.status === expectedStatus) {
                return {
                    status: 'up',
                    status_code: response.status,
                    message: 'Service is healthy'
                };
            } else if (response.status >= 500) {
                return {
                    status: 'down',
                    status_code: response.status,
                    message: `HTTP ${response.status} - Server error`
                };
            } else if (response.status >= 400) {
                return {
                    status: 'warning',
                    status_code: response.status,
                    message: `HTTP ${response.status} - Client error`
                };
            } else {
                return {
                    status: 'up',
                    status_code: response.status,
                    message: `HTTP ${response.status}`
                };
            }

        } catch (error) {
            return {
                status: 'down',
                message: error.message
            };
        }
    }

    // Check Ping
    async checkPing(monitor) {
        return new Promise((resolve) => {
            const count = monitor.config?.count || 4;
            const command = process.platform === 'win32' 
                ? `ping -n ${count} ${monitor.target}`
                : `ping -c ${count} ${monitor.target}`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    resolve({
                        status: 'down',
                        message: error.message
                    });
                } else {
                    // Check if ping was successful
                    const success = stdout.includes('time=') || stdout.includes('time<');
                    if (success) {
                        resolve({
                            status: 'up',
                            message: 'Ping successful'
                        });
                    } else {
                        resolve({
                            status: 'down',
                            message: 'Ping failed'
                        });
                    }
                }
            });
        });
    }

    // Check TCP
    async checkTCP(monitor) {
        const port = monitor.port || 80;
        const timeout = (monitor.timeout || 10) * 1000;

        return new Promise((resolve) => {
            const socket = new net.Socket();
            let resolved = false;

            socket.setTimeout(timeout);

            socket.on('connect', () => {
                if (!resolved) {
                    resolved = true;
                    socket.destroy();
                    resolve({
                        status: 'up',
                        message: `Connected to port ${port}`
                    });
                }
            });

            socket.on('error', (error) => {
                if (!resolved) {
                    resolved = true;
                    socket.destroy();
                    resolve({
                        status: 'down',
                        message: error.message
                    });
                }
            });

            socket.on('timeout', () => {
                if (!resolved) {
                    resolved = true;
                    socket.destroy();
                    resolve({
                        status: 'down',
                        message: 'Connection timeout'
                    });
                }
            });

            socket.connect(port, monitor.target);
        });
    }

    // Check DNS
    async checkDNS(monitor) {
        const recordType = monitor.config?.record_type || 'A';
        const timeout = (monitor.timeout || 5) * 1000;

        return new Promise((resolve) => {
            const resolver = new dns.Resolver();
            resolver.setTimeout(timeout);

            const resolveFn = {
                'A': resolver.resolve4.bind(resolver),
                'AAAA': resolver.resolve6.bind(resolver),
                'MX': resolver.resolveMx.bind(resolver),
                'TXT': resolver.resolveTxt.bind(resolver),
                'CNAME': resolver.resolveCname.bind(resolver)
            }[recordType] || resolver.resolve4.bind(resolver);

            resolveFn(monitor.target, (err, result) => {
                if (err) {
                    resolve({
                        status: 'down',
                        message: err.message
                    });
                } else {
                    resolve({
                        status: 'up',
                        message: `DNS resolution successful (${recordType})`,
                        data: result
                    });
                }
            });
        });
    }

    // Update monitor status
    async updateMonitorStatus(monitorId, result, responseTime) {
        const monitor = this.monitors.get(monitorId);
        if (!monitor) return;

        const previousStatus = monitor.status;
        const newStatus = result.status;

        // Update in-memory
        monitor.status = newStatus;
        monitor.response_time = responseTime || 0;
        monitor.last_check = new Date();

        if (newStatus === 'up') {
            monitor.successCount++;
            monitor.failCount = 0;
        } else {
            monitor.failCount++;
            monitor.successCount = 0;
        }

        // Calculate uptime
        const total = monitor.successCount + monitor.failCount;
        if (total > 0) {
            monitor.uptime_percentage = (monitor.successCount / total) * 100;
        }

        // Update database
        try {
            await Monitor.update({
                status: newStatus,
                response_time: monitor.response_time,
                last_check: monitor.last_check,
                uptime_percentage: monitor.uptime_percentage,
                fail_count: monitor.failCount,
                success_count: monitor.successCount
            }, {
                where: { id: monitorId }
            });
        } catch (error) {
            logger.error(`❌ Update monitor ${monitorId} error:`, error);
        }

        // Handle status change
        if (previousStatus !== newStatus) {
            await this.handleStatusChange(monitorId, previousStatus, newStatus, result);
        }
    }

    // Handle status change
    async handleStatusChange(monitorId, oldStatus, newStatus, result) {
        const monitor = this.monitors.get(monitorId);
        if (!monitor) return;

        // Update last status change time
        monitor.last_status_change = new Date();

        // Create alert if status is down
        if (newStatus === 'down') {
            await this.createAlert(monitor, result);
        }

        // Create recovery alert if status was down and now up
        if (oldStatus === 'down' && newStatus === 'up') {
            await this.createRecoveryAlert(monitor);
        }

        logger.info(`🔄 Monitor ${monitor.name} changed: ${oldStatus} → ${newStatus}`);
    }

    // Create alert
    async createAlert(monitor, result) {
        try {
            const alertData = {
                severity: monitor.failCount >= 3 ? 'critical' : 'high',
                source_type: 'monitor',
                source_id: monitor.id,
                server_id: monitor.server_id || null,
                message: `${monitor.name} is DOWN: ${result.message}`,
                details: {
                    monitor_name: monitor.name,
                    monitor_type: monitor.type,
                    target: monitor.target,
                    status_code: result.status_code,
                    message: result.message,
                    fail_count: monitor.failCount
                }
            };

            await alertService.processAlert(alertData);
        } catch (error) {
            logger.error('❌ Create alert error:', error);
        }
    }

    // Create recovery alert
    async createRecoveryAlert(monitor) {
        try {
            const alertData = {
                severity: 'info',
                source_type: 'monitor',
                source_id: monitor.id,
                server_id: monitor.server_id || null,
                message: `${monitor.name} is UP (recovered)`,
                details: {
                    monitor_name: monitor.name,
                    monitor_type: monitor.type,
                    target: monitor.target,
                    uptime: monitor.uptime_percentage
                }
            };

            await alertService.processAlert(alertData);
        } catch (error) {
            logger.error('❌ Create recovery alert error:', error);
        }
    }

    // Add monitor
    async addMonitor(monitorData) {
        try {
            const monitor = await Monitor.create({
                id: uuidv4(),
                ...monitorData
            });

            this.monitors.set(monitor.id, {
                ...monitor.toJSON(),
                lastCheck: null,
                failCount: 0,
                successCount: 0
            });

            logger.info(`✅ Monitor added: ${monitor.name}`);
            return monitor;
        } catch (error) {
            logger.error('❌ Add monitor error:', error);
            throw error;
        }
    }

    // Update monitor
    async updateMonitor(monitorId, updateData) {
        try {
            await Monitor.update(updateData, { where: { id: monitorId } });

            const monitor = await Monitor.findByPk(monitorId);
            if (monitor) {
                this.monitors.set(monitorId, {
                    ...monitor.toJSON(),
                    failCount: 0,
                    successCount: 0
                });
            }

            logger.info(`✅ Monitor updated: ${monitorId}`);
            return monitor;
        } catch (error) {
            logger.error('❌ Update monitor error:', error);
            throw error;
        }
    }

    // Delete monitor
    async deleteMonitor(monitorId) {
        try {
            await Monitor.destroy({ where: { id: monitorId } });
            this.monitors.delete(monitorId);

            logger.info(`✅ Monitor deleted: ${monitorId}`);
            return true;
        } catch (error) {
            logger.error('❌ Delete monitor error:', error);
            throw error;
        }
    }

    // Get monitor status
    getMonitorStatus(monitorId) {
        return this.monitors.get(monitorId) || null;
    }

    // Get all monitor statuses
    getAllMonitorStatuses() {
        const statuses = [];
        for (const [id, monitor] of this.monitors) {
            statuses.push({
                id: id,
                name: monitor.name,
                status: monitor.status,
                response_time: monitor.response_time,
                uptime: monitor.uptime_percentage,
                last_check: monitor.last_check
            });
        }
        return statuses;
    }

    // Get statistics
    async getStatistics() {
        const total = this.monitors.size;
        let up = 0, down = 0, warning = 0, unknown = 0;

        for (const monitor of this.monitors.values()) {
            switch (monitor.status) {
                case 'up': up++; break;
                case 'down': down++; break;
                case 'warning': warning++; break;
                default: unknown++; break;
            }
        }

        return {
            total,
            up,
            down,
            warning,
            unknown,
            uptime_percentage: total > 0 ? (up / total) * 100 : 0
        };
    }
}

// Export singleton
const monitorService = new MonitorService();
module.exports = monitorService;
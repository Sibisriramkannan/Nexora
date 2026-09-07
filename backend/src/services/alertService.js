const { v4: uuidv4 } = require('uuid');
const Alert = require('../models/Alert');
const logger = require('../utils/logger');
const emailService = require('./emailService');
const slackService = require('./slackService');
const telegramService = require('./telegramService');
const pagerdutyService = require('./pagerdutyService');
const jiraService = require('./jiraService');

class AlertService {
    constructor() {
        this.dedupCache = new Map();
        this.flappingCache = new Map();
        this.rateLimitCache = new Map();
        this.alertCounts = new Map();
        this.lastAlertReset = Date.now();
    }

    // Process alert
    async processAlert(alertData) {
        try {
            // Check rate limit
            if (!this.checkRateLimit(alertData)) {
                logger.warn('⚠️ Rate limit exceeded for alerts');
                return null;
            }

            // Check deduplication
            const dedupKey = this.getDedupKey(alertData);
            if (this.isDuplicate(dedupKey)) {
                logger.debug('Duplicate alert suppressed');
                return null;
            }

            // Check flapping
            const flappingKey = `${alertData.server_id}:${alertData.source_type}`;
            if (this.isFlapping(flappingKey, alertData.status)) {
                logger.warn('⚠️ Flapping detected, suppressing alert');
                return null;
            }

            // Create alert
            const alert = await Alert.create({
                id: uuidv4(),
                severity: alertData.severity || 'warning',
                status: 'triggered',
                source_type: alertData.source_type || 'system',
                source_id: alertData.source_id || alertData.server_id,
                server_id: alertData.server_id || null,
                message: alertData.message,
                details: alertData.details || {},
                triggered_at: new Date()
            });

            // Send notifications
            await this.sendNotifications(alert);

            // Update dedup cache
            this.addToDedupCache(dedupKey);

            // Track alert count
            this.trackAlertCount();

            logger.info(`🚨 Alert created: ${alert.id} - ${alert.severity} - ${alert.message}`);
            return alert;
        } catch (error) {
            logger.error('❌ Alert processing error:', error);
            throw error;
        }
    }

    // Acknowledge alert
    async acknowledgeAlert(alertId, userId) {
        try {
            const alert = await Alert.findByPk(alertId);
            if (!alert) {
                throw new Error('Alert not found');
            }

            await alert.update({
                status: 'acknowledged',
                acknowledged_at: new Date(),
                acknowledged_by: userId
            });

            logger.info(`✅ Alert acknowledged: ${alertId}`);
            return alert;
        } catch (error) {
            logger.error('❌ Alert acknowledge error:', error);
            throw error;
        }
    }

    // Resolve alert
    async resolveAlert(alertId, userId) {
        try {
            const alert = await Alert.findByPk(alertId);
            if (!alert) {
                throw new Error('Alert not found');
            }

            await alert.update({
                status: 'resolved',
                resolved_at: new Date(),
                resolved_by: userId
            });

            // Resolve in PagerDuty
            await pagerdutyService.resolveAlert(alert);

            // Resolve in Jira
            if (alert.details?.jira_issue_key) {
                await jiraService.resolveIssue(alert.details.jira_issue_key);
            }

            logger.info(`✅ Alert resolved: ${alertId}`);
            return alert;
        } catch (error) {
            logger.error('❌ Alert resolve error:', error);
            throw error;
        }
    }

    // Mute alert
    async muteAlert(alertId, duration = 3600) {
        try {
            const alert = await Alert.findByPk(alertId);
            if (!alert) {
                throw new Error('Alert not found');
            }

            await alert.update({
                status: 'muted',
                muted_until: new Date(Date.now() + duration * 1000)
            });

            logger.info(`🔇 Alert muted: ${alertId}`);
            return alert;
        } catch (error) {
            logger.error('❌ Alert mute error:', error);
            throw error;
        }
    }

    // Send notifications
    async sendNotifications(alert) {
        const results = [];

        // Send based on severity and configuration
        if (alert.severity === 'critical' || alert.severity === 'high') {
            // PagerDuty for critical
            if (process.env.PAGERDUTY_ENABLED !== 'false') {
                const result = await pagerdutyService.sendAlert(alert);
                results.push({ channel: 'pagerduty', ...result });
            }

            // Jira for critical and high
            if (process.env.JIRA_ENABLED !== 'false') {
                const result = await jiraService.createIssue(alert);
                if (result.success && result.issue_key) {
                    await alert.update({
                        details: {
                            ...alert.details,
                            jira_issue_key: result.issue_key
                        }
                    });
                }
                results.push({ channel: 'jira', ...result });
            }
        }

        // Slack for all alerts
        if (process.env.SLACK_ENABLED !== 'false') {
            const result = await slackService.sendSlackAlert(alert);
            results.push({ channel: 'slack', ...result });
        }

        // Email for all alerts
        if (process.env.EMAIL_ENABLED !== 'false') {
            const result = await emailService.sendAlertEmail(alert);
            results.push({ channel: 'email', ...result });
        }

        // Telegram for all alerts
        if (process.env.TELEGRAM_ENABLED !== 'false') {
            const result = await telegramService.sendAlert(alert);
            results.push({ channel: 'telegram', ...result });
        }

        // Update alert with notification status
        await alert.update({
            notification_sent: true,
            notification_channels: results.filter(r => r.success).map(r => r.channel)
        });

        return results;
    }

    // Get alerts
    async getAlerts(filters = {}) {
        try {
            const where = {};
            
            if (filters.status) {
                where.status = filters.status;
            }
            if (filters.severity) {
                where.severity = filters.severity;
            }
            if (filters.server_id) {
                where.server_id = filters.server_id;
            }
            if (filters.source_type) {
                where.source_type = filters.source_type;
            }

            const alerts = await Alert.findAll({
                where,
                order: [['triggered_at', 'DESC']],
                limit: parseInt(filters.limit) || 100
            });

            return alerts;
        } catch (error) {
            logger.error('❌ Get alerts error:', error);
            throw error;
        }
    }

    // Get alert stats
    async getAlertStats() {
        try {
            const total = await Alert.count();
            const active = await Alert.count({ where: { status: 'triggered' } });
            const acknowledged = await Alert.count({ where: { status: 'acknowledged' } });
            const resolved = await Alert.count({ where: { status: 'resolved' } });
            
            const critical = await Alert.count({ where: { severity: 'critical' } });
            const high = await Alert.count({ where: { severity: 'high' } });
            const warning = await Alert.count({ where: { severity: 'warning' } });
            const info = await Alert.count({ where: { severity: 'info' } });

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayAlerts = await Alert.count({
                where: {
                    triggered_at: { [require('sequelize').Op.gte]: today }
                }
            });

            return {
                total,
                active,
                acknowledged,
                resolved,
                critical,
                high,
                warning,
                info,
                today: todayAlerts
            };
        } catch (error) {
            logger.error('❌ Get alert stats error:', error);
            throw error;
        }
    }

    // Check rate limit
    checkRateLimit(alertData) {
        const key = `${alertData.server_id}:${alertData.source_type}`;
        const now = Date.now();

        // Reset counters hourly
        if (now - this.lastAlertReset > 3600000) {
            this.alertCounts.clear();
            this.lastAlertReset = now;
        }

        const count = this.alertCounts.get(key) || 0;
        if (count >= 10) { // Max 10 alerts per hour per source
            return false;
        }

        this.alertCounts.set(key, count + 1);
        return true;
    }

    // Get dedup key
    getDedupKey(alertData) {
        return `${alertData.server_id}:${alertData.source_type}:${alertData.message}`;
    }

    // Check if duplicate
    isDuplicate(key) {
        const entry = this.dedupCache.get(key);
        if (!entry) return false;

        // Check if within dedup window (default: 1 hour)
        const dedupWindow = process.env.ALERT_DEDUP_WINDOW || 3600;
        return (Date.now() - entry.timestamp) < dedupWindow * 1000;
    }

    // Add to dedup cache
    addToDedupCache(key) {
        this.dedupCache.set(key, {
            timestamp: Date.now(),
            count: (this.dedupCache.get(key)?.count || 0) + 1
        });
    }

    // Check flapping
    isFlapping(key, status) {
        const entry = this.flappingCache.get(key) || { states: [], lastCheck: Date.now() };
        entry.states.push(status);
        
        // Keep last 5 states
        if (entry.states.length > 5) {
            entry.states.shift();
        }

        // Check for flapping (alternating states)
        if (entry.states.length >= 5) {
            let changes = 0;
            for (let i = 1; i < entry.states.length; i++) {
                if (entry.states[i] !== entry.states[i - 1]) {
                    changes++;
                }
            }
            
            const flappingThreshold = process.env.ALERT_FLAPPING_THRESHOLD || 3;
            if (changes >= flappingThreshold) {
                return true;
            }
        }

        this.flappingCache.set(key, entry);
        return false;
    }

    // Track alert count
    trackAlertCount() {
        // Placeholder for metrics tracking
    }

    // Clean old dedup entries
    cleanupDedupCache() {
        const now = Date.now();
        const dedupWindow = (process.env.ALERT_DEDUP_WINDOW || 3600) * 1000;

        for (const [key, entry] of this.dedupCache) {
            if (now - entry.timestamp > dedupWindow) {
                this.dedupCache.delete(key);
            }
        }
    }

    // Start cleanup interval
    startCleanup() {
        setInterval(() => {
            this.cleanupDedupCache();
        }, 60000); // Run every minute
    }
}

// Export singleton
const alertService = new AlertService();
module.exports = alertService;
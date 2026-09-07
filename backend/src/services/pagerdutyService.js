const axios = require('axios');
const logger = require('../utils/logger');

class PagerDutyService {
    constructor() {
        this.serviceKey = process.env.PAGERDUTY_SERVICE_KEY;
        this.enabled = !!this.serviceKey;
        this.apiUrl = 'https://events.pagerduty.com/v2/enqueue';
    }

    // Send alert to PagerDuty
    async sendAlert(alert) {
        if (!this.enabled) {
            logger.warn('⚠️ PagerDuty not configured');
            return { success: false, error: 'PagerDuty not configured' };
        }

        try {
            const severityMap = {
                critical: 'critical',
                high: 'error',
                warning: 'warning',
                info: 'info'
            };

            const severity = severityMap[alert.severity] || 'info';

            const payload = {
                routing_key: this.serviceKey,
                event_action: 'trigger',
                payload: {
                    summary: alert.message,
                    source: alert.details?.server_name || 'Nexora',
                    severity: severity,
                    timestamp: new Date(alert.triggered_at).toISOString(),
                    component: alert.details?.component || 'Nexora',
                    group: alert.details?.group || 'Infrastructure',
                    class: alert.details?.class || 'Alert',
                    custom_details: {
                        alert_id: alert.id,
                        server_name: alert.details?.server_name || 'N/A',
                        server_ip: alert.details?.server_ip || 'N/A',
                        description: alert.details?.description || '',
                        remediation: alert.details?.remediation || '',
                        source_type: alert.source_type || 'system'
                    }
                },
                links: [
                    {
                        href: `${process.env.FRONTEND_URL}/alerts/${alert.id}`,
                        text: 'View in Nexora'
                    }
                ]
            };

            const response = await axios.post(this.apiUrl, payload);

            if (response.status === 202) {
                logger.info('✅ PagerDuty alert sent');
                return { success: true, data: response.data };
            } else {
                throw new Error(`PagerDuty API error: ${response.status}`);
            }
        } catch (error) {
            logger.error('❌ PagerDuty send error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Resolve alert in PagerDuty
    async resolveAlert(alert) {
        if (!this.enabled) {
            return { success: false, error: 'PagerDuty not configured' };
        }

        try {
            const payload = {
                routing_key: this.serviceKey,
                event_action: 'resolve',
                dedup_key: alert.id,
                payload: {
                    summary: `Resolved: ${alert.message}`,
                    source: alert.details?.server_name || 'Nexora',
                    timestamp: new Date().toISOString()
                }
            };

            const response = await axios.post(this.apiUrl, payload);

            if (response.status === 202) {
                logger.info('✅ PagerDuty alert resolved');
                return { success: true };
            } else {
                throw new Error(`PagerDuty API error: ${response.status}`);
            }
        } catch (error) {
            logger.error('❌ PagerDuty resolve error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Send custom event
    async sendCustomEvent(event) {
        if (!this.enabled) {
            return { success: false, error: 'PagerDuty not configured' };
        }

        try {
            const payload = {
                routing_key: this.serviceKey,
                event_action: event.action || 'trigger',
                payload: {
                    summary: event.summary,
                    source: event.source || 'Nexora',
                    severity: event.severity || 'info',
                    timestamp: new Date().toISOString(),
                    custom_details: event.details || {}
                }
            };

            if (event.dedup_key) {
                payload.dedup_key = event.dedup_key;
            }

            const response = await axios.post(this.apiUrl, payload);

            return { success: response.status === 202 };
        } catch (error) {
            logger.error('❌ PagerDuty custom event error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Acknowledge alert
    async acknowledgeAlert(alert) {
        return await this.sendCustomEvent({
            action: 'trigger',
            summary: `Acknowledged: ${alert.message}`,
            dedup_key: alert.id,
            source: alert.details?.server_name || 'Nexora',
            severity: 'info',
            details: {
                acknowledged_by: alert.acknowledged_by || 'System',
                acknowledged_at: new Date().toISOString()
            }
        });
    }

    // Send heartbeat
    async sendHeartbeat() {
        if (!this.enabled) {
            return { success: false, error: 'PagerDuty not configured' };
        }

        try {
            const payload = {
                routing_key: this.serviceKey,
                event_action: 'trigger',
                payload: {
                    summary: 'Nexora Heartbeat',
                    source: 'Nexora',
                    severity: 'info',
                    timestamp: new Date().toISOString(),
                    custom_details: {
                        status: 'healthy',
                        uptime: process.uptime()
                    }
                }
            };

            const response = await axios.post(this.apiUrl, payload);

            return { success: response.status === 202 };
        } catch (error) {
            logger.error('❌ PagerDuty heartbeat error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Get service status
    async getServiceStatus() {
        // PagerDuty doesn't have a simple status endpoint via events API
        // This is a placeholder
        return {
            enabled: this.enabled,
            service_key: this.serviceKey ? `${this.serviceKey.substring(0, 8)}...` : null
        };
    }
}

// Export singleton
const pagerdutyService = new PagerDutyService();
module.exports = pagerdutyService;
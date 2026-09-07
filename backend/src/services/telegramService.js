const axios = require('axios');
const logger = require('../utils/logger');

class TelegramService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.chatId = process.env.TELEGRAM_CHAT_ID;
        this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
        this.enabled = !!this.botToken && !!this.chatId;
    }

    // Send message to Telegram
    async sendMessage(message, options = {}) {
        if (!this.enabled) {
            logger.warn('⚠️ Telegram not configured');
            return { success: false, error: 'Telegram not configured' };
        }

        try {
            const payload = {
                chat_id: options.chatId || this.chatId,
                text: message,
                parse_mode: options.parseMode || 'HTML',
                disable_notification: options.disableNotification || false
            };

            if (options.keyboard) {
                payload.reply_markup = {
                    inline_keyboard: options.keyboard
                };
            }

            const response = await axios.post(
                `${this.baseUrl}/sendMessage`,
                payload
            );

            if (response.data.ok) {
                logger.info('✅ Telegram message sent');
                return { success: true, data: response.data.result };
            } else {
                throw new Error(response.data.description || 'Telegram API error');
            }
        } catch (error) {
            logger.error('❌ Telegram send error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Send alert to Telegram
    async sendAlert(alert) {
        const severityEmojis = {
            critical: '🚨',
            high: '⚠️',
            warning: '⚡',
            info: 'ℹ️'
        };

        const emoji = severityEmojis[alert.severity] || '📢';

        let message = `${emoji} <b>${alert.severity.toUpperCase()} ALERT</b>\n\n`;
        message += `<b>Message:</b> ${alert.message}\n`;
        message += `<b>Time:</b> ${new Date(alert.triggered_at).toLocaleString()}\n`;

        if (alert.details?.server_name) {
            message += `<b>Server:</b> ${alert.details.server_name}\n`;
        }
        if (alert.details?.server_ip) {
            message += `<b>IP:</b> ${alert.details.server_ip}\n`;
        }
        if (alert.details?.description) {
            message += `\n<b>Description:</b>\n${alert.details.description}\n`;
        }
        if (alert.details?.remediation) {
            message += `\n<b>Remediation:</b>\n${alert.details.remediation}\n`;
        }

        message += `\n🔗 <a href="${process.env.FRONTEND_URL}/alerts/${alert.id}">View in Nexora</a>`;

        // Create inline keyboard
        const keyboard = [
            [
                {
                    text: '✅ Acknowledge',
                    callback_data: `ack_${alert.id}`
                },
                {
                    text: '🔍 View',
                    callback_data: `view_${alert.id}`
                }
            ]
        ];

        return await this.sendMessage(message, {
            parseMode: 'HTML',
            keyboard: keyboard
        });
    }

    // Send heartbeat
    async sendHeartbeat(status) {
        const message = `
🔄 <b>Nexora Agent Heartbeat</b>
<b>Status:</b> ${status}
<b>Time:</b> ${new Date().toLocaleString()}
<b>Server:</b> ${process.env.SERVER_NAME || 'Nexora'}
        `;

        return await this.sendMessage(message);
    }

    // Send daily summary
    async sendDailySummary(summary) {
        let message = `
📊 <b>Daily Report - ${new Date().toLocaleDateString()}</b>

<b>Servers:</b> ${summary.total_servers} (${summary.online_servers} online)
<b>Monitors:</b> ${summary.total_monitors} (${summary.up_monitors} up)
<b>Alerts:</b> ${summary.total_alerts} (${summary.active_alerts} active)
<b>Critical:</b> ${summary.critical_alerts}
<b>Vulnerabilities:</b> ${summary.vulnerabilities || 0}
        `;

        if (summary.top_alerts && summary.top_alerts.length > 0) {
            message += '\n<b>Top Alerts:</b>\n';
            for (const alert of summary.top_alerts.slice(0, 5)) {
                message += `• ${alert.message}\n`;
            }
        }

        return await this.sendMessage(message);
    }

    // Send custom message with formatting
    async sendCustomMessage(text, format = 'HTML') {
        return await this.sendMessage(text, { parseMode: format });
    }

    // Send file to Telegram
    async sendFile(filePath, caption = '') {
        if (!this.enabled) {
            return { success: false, error: 'Telegram not configured' };
        }

        try {
            const formData = new FormData();
            formData.append('chat_id', this.chatId);
            formData.append('document', filePath);
            if (caption) {
                formData.append('caption', caption);
            }

            const response = await axios.post(
                `${this.baseUrl}/sendDocument`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            return { success: true, data: response.data.result };
        } catch (error) {
            logger.error('❌ Telegram file send error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Set webhook
    async setWebhook(url) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/setWebhook`,
                {
                    params: { url }
                }
            );
            return { success: response.data.ok };
        } catch (error) {
            logger.error('❌ Telegram webhook error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Delete webhook
    async deleteWebhook() {
        try {
            const response = await axios.get(`${this.baseUrl}/deleteWebhook`);
            return { success: response.data.ok };
        } catch (error) {
            logger.error('❌ Telegram webhook delete error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Get webhook info
    async getWebhookInfo() {
        try {
            const response = await axios.get(`${this.baseUrl}/getWebhookInfo`);
            return { success: true, data: response.data.result };
        } catch (error) {
            logger.error('❌ Telegram webhook info error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Send action (typing, upload, etc.)
    async sendAction(action = 'typing') {
        if (!this.enabled) {
            return { success: false, error: 'Telegram not configured' };
        }

        try {
            const response = await axios.post(
                `${this.baseUrl}/sendChatAction`,
                {
                    chat_id: this.chatId,
                    action: action
                }
            );
            return { success: response.data.ok };
        } catch (error) {
            logger.error('❌ Telegram action error:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// Export singleton
const telegramService = new TelegramService();
module.exports = telegramService;
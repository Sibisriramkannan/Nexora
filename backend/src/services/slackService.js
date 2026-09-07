const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const sendSlackMessage = async ({ channel, message, attachments, blocks }) => {
    try {
        const webhookUrl = process.env.SLACK_WEBHOOK;
        if (!webhookUrl) {
            console.warn('⚠️ Slack webhook not configured');
            return { success: false, error: 'Slack webhook not configured' };
        }

        const payload = {
            channel: channel || '#alerts',
            text: message || 'Alert from Nexora',
            attachments: attachments || [],
            blocks: blocks || []
        };

        const response = await axios.post(webhookUrl, payload);
        return { success: true, status: response.status };
    } catch (error) {
        console.error('❌ Slack send error:', error);
        return { success: false, error: error.message };
    }
};

const sendSlackAlert = async (alert) => {
    const colors = {
        critical: '#ff0000',
        high: '#ff8800',
        warning: '#ffcc00',
        info: '#44aaff'
    };

    const blocks = [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: `🚨 ${alert.severity.toUpperCase()} Alert`,
                emoji: true
            }
        },
        {
            type: 'section',
            fields: [
                {
                    type: 'mrkdwn',
                    text: `*Message:*\n${alert.message}`
                },
                {
                    type: 'mrkdwn',
                    text: `*Time:*\n${new Date(alert.triggered_at).toLocaleString()}`
                }
            ]
        }
    ];

    if (alert.details?.server_name) {
        blocks.push({
            type: 'section',
            fields: [
                {
                    type: 'mrkdwn',
                    text: `*Server:*\n${alert.details.server_name}`
                },
                {
                    type: 'mrkdwn',
                    text: `*IP:*\n${alert.details.server_ip || 'N/A'}`
                }
            ]
        });
    }

    if (alert.details?.description) {
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Description:*\n${alert.details.description}`
            }
        });
    }

    if (alert.details?.remediation) {
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Remediation:*\n${alert.details.remediation}`
            }
        });
    }

    blocks.push({
        type: 'actions',
        elements: [
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'View in Nexora',
                    emoji: true
                },
                url: `${process.env.FRONTEND_URL}/alerts/${alert.id}`
            },
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'Acknowledge',
                    emoji: true
                },
                value: `ack_${alert.id}`
            }
        ]
    });

    return await sendSlackMessage({
        channel: '#alerts',
        blocks: blocks
    });
};

module.exports = { sendSlackMessage, sendSlackAlert };
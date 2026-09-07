const { v4: uuidv4 } = require('uuid');
const Integration = require('../../models/Integration');
const { sendEmail } = require('../../services/emailService');
const { sendSlackMessage } = require('../../services/slackService');
const axios = require('axios');

// Get all integrations
exports.getAllIntegrations = async (req, res) => {
    try {
        const integrations = await Integration.findAll({
            order: [['created_at', 'DESC']]
        });
        res.json({
            success: true,
            data: integrations
        });
    } catch (error) {
        console.error('Error fetching integrations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch integrations',
            error: error.message
        });
    }
};

// Get integration by ID
exports.getIntegrationById = async (req, res) => {
    try {
        const integration = await Integration.findByPk(req.params.id);
        if (!integration) {
            return res.status(404).json({
                success: false,
                message: 'Integration not found'
            });
        }
        res.json({
            success: true,
            data: integration
        });
    } catch (error) {
        console.error('Error fetching integration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch integration',
            error: error.message
        });
    }
};

// Create integration
exports.createIntegration = async (req, res) => {
    try {
        const integrationData = {
            ...req.body,
            id: uuidv4(),
            created_by: req.user.id,
            test_status: 'pending'
        };

        const integration = await Integration.create(integrationData);

        res.status(201).json({
            success: true,
            data: integration,
            message: 'Integration created successfully'
        });
    } catch (error) {
        console.error('Error creating integration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create integration',
            error: error.message
        });
    }
};

// Update integration
exports.updateIntegration = async (req, res) => {
    try {
        const integration = await Integration.findByPk(req.params.id);
        if (!integration) {
            return res.status(404).json({
                success: false,
                message: 'Integration not found'
            });
        }

        await integration.update(req.body);

        res.json({
            success: true,
            data: integration,
            message: 'Integration updated successfully'
        });
    } catch (error) {
        console.error('Error updating integration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update integration',
            error: error.message
        });
    }
};

// Delete integration
exports.deleteIntegration = async (req, res) => {
    try {
        const integration = await Integration.findByPk(req.params.id);
        if (!integration) {
            return res.status(404).json({
                success: false,
                message: 'Integration not found'
            });
        }

        await integration.destroy();

        res.json({
            success: true,
            message: 'Integration deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting integration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete integration',
            error: error.message
        });
    }
};

// Test integration
exports.testIntegration = async (req, res) => {
    try {
        const integration = await Integration.findByPk(req.params.id);
        if (!integration) {
            return res.status(404).json({
                success: false,
                message: 'Integration not found'
            });
        }

        let testResult = { success: false, message: 'Test failed' };

        switch (integration.type) {
            case 'email':
                testResult = await testEmailIntegration(integration);
                break;
            case 'slack':
                testResult = await testSlackIntegration(integration);
                break;
            case 'telegram':
                testResult = await testTelegramIntegration(integration);
                break;
            case 'webhook':
                testResult = await testWebhookIntegration(integration);
                break;
            default:
                testResult = { success: false, message: 'Unsupported integration type' };
        }

        await integration.update({
            last_test: new Date(),
            test_status: testResult.success ? 'success' : 'failed'
        });

        res.json({
            success: true,
            data: testResult,
            message: testResult.success ? 'Test successful' : 'Test failed'
        });
    } catch (error) {
        console.error('Error testing integration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to test integration',
            error: error.message
        });
    }
};

// Test helpers
async function testEmailIntegration(integration) {
    try {
        const result = await sendEmail({
            to: integration.config.test_email || process.env.EMAIL_USER,
            subject: 'Nexora Integration Test',
            text: 'This is a test email from Nexora. Your email integration is working!'
        });
        return { success: result.success, message: 'Email sent successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function testSlackIntegration(integration) {
    try {
        const result = await sendSlackMessage({
            channel: integration.config.channel || '#alerts',
            message: '🔔 Nexora Integration Test: Your Slack integration is working!'
        });
        return { success: result.success, message: 'Slack message sent successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function testTelegramIntegration(integration) {
    try {
        const { botToken, chatId } = integration.config;
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: '🔔 Nexora Integration Test: Your Telegram integration is working!'
        });
        return { success: true, message: 'Telegram message sent successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function testWebhookIntegration(integration) {
    try {
        await axios.post(integration.config.url, {
            test: true,
            message: 'Nexora integration test',
            timestamp: new Date().toISOString()
        }, {
            headers: integration.config.headers || {}
        });
        return { success: true, message: 'Webhook test successful' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

module.exports = exports;
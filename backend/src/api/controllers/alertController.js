const { v4: uuidv4 } = require('uuid');
const Alert = require('../../models/Alert');
const Server = require('../../models/Server');

// Get all alerts
exports.getAllAlerts = async (req, res) => {
    try {
        const { status, severity, limit = 50 } = req.query;
        const where = {};
        
        if (status) where.status = status;
        if (severity) where.severity = severity;

        const alerts = await Alert.findAll({
            where,
            include: [{
                model: Server,
                attributes: ['name', 'ip_address']
            }],
            order: [['triggered_at', 'DESC']],
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch alerts',
            error: error.message
        });
    }
};

// Get alert by ID
exports.getAlertById = async (req, res) => {
    try {
        const alert = await Alert.findByPk(req.params.id, {
            include: [{
                model: Server,
                attributes: ['name', 'ip_address']
            }]
        });
        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }
        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        console.error('Error fetching alert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch alert',
            error: error.message
        });
    }
};

// Acknowledge alert
exports.acknowledgeAlert = async (req, res) => {
    try {
        const alert = await Alert.findByPk(req.params.id);
        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        await alert.update({
            status: 'acknowledged',
            acknowledged_at: new Date(),
            acknowledged_by: req.user.id
        });

        res.json({
            success: true,
            message: 'Alert acknowledged successfully'
        });
    } catch (error) {
        console.error('Error acknowledging alert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to acknowledge alert',
            error: error.message
        });
    }
};

// Resolve alert
exports.resolveAlert = async (req, res) => {
    try {
        const alert = await Alert.findByPk(req.params.id);
        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        await alert.update({
            status: 'resolved',
            resolved_at: new Date(),
            resolved_by: req.user.id
        });

        res.json({
            success: true,
            message: 'Alert resolved successfully'
        });
    } catch (error) {
        console.error('Error resolving alert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resolve alert',
            error: error.message
        });
    }
};

// Mute alert
exports.muteAlert = async (req, res) => {
    try {
        const { duration = 3600 } = req.body; // Default 1 hour
        const alert = await Alert.findByPk(req.params.id);
        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        await alert.update({
            status: 'muted',
            muted_until: new Date(Date.now() + duration * 1000)
        });

        res.json({
            success: true,
            message: 'Alert muted successfully'
        });
    } catch (error) {
        console.error('Error muting alert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mute alert',
            error: error.message
        });
    }
};

// Get alert statistics
exports.getAlertStats = async (req, res) => {
    try {
        const total = await Alert.count();
        const active = await Alert.count({ where: { status: 'triggered' } });
        const critical = await Alert.count({ 
            where: { severity: 'critical', status: 'triggered' } 
        });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayAlerts = await Alert.count({
            where: {
                triggered_at: { [require('sequelize').Op.gte]: today }
            }
        });

        res.json({
            success: true,
            data: {
                total,
                active,
                critical,
                today: todayAlerts
            }
        });
    } catch (error) {
        console.error('Error fetching alert stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch alert stats',
            error: error.message
        });
    }
};

module.exports = exports;
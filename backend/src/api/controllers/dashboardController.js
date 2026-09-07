const { Op } = require('sequelize');
const Server = require('../../models/Server');
const Monitor = require('../../models/Monitor');
const Alert = require('../../models/Alert');
const Scan = require('../../models/Scan');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        // Server stats
        const totalServers = await Server.count();
        const onlineServers = await Server.count({ where: { status: 'online' } });
        const offlineServers = await Server.count({ where: { status: 'offline' } });
        const warningServers = await Server.count({ where: { status: 'warning' } });

        // Monitor stats
        const totalMonitors = await Monitor.count();
        const upMonitors = await Monitor.count({ where: { status: 'up' } });
        const downMonitors = await Monitor.count({ where: { status: 'down' } });
        const warningMonitors = await Monitor.count({ where: { status: 'warning' } });

        // Alert stats
        const totalAlerts = await Alert.count();
        const activeAlerts = await Alert.count({ where: { status: 'triggered' } });
        const criticalAlerts = await Alert.count({ 
            where: { severity: 'critical', status: 'triggered' } 
        });
        const highAlerts = await Alert.count({ 
            where: { severity: 'high', status: 'triggered' } 
        });

        // Today's alerts
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayAlerts = await Alert.count({
            where: { triggered_at: { [Op.gte]: today } }
        });

        // Scan stats
        const totalScans = await Scan.count();
        const completedScans = await Scan.count({ where: { status: 'completed' } });
        const runningScans = await Scan.count({ where: { status: 'running' } });
        const failedScans = await Scan.count({ where: { status: 'failed' } });

        // Vulnerability stats from recent scans
        const recentScans = await Scan.findAll({
            where: { status: 'completed' },
            order: [['created_at', 'DESC']],
            limit: 10
        });

        let vulns = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
        for (const scan of recentScans) {
            const results = scan.results || { findings: [] };
            for (const finding of results.findings || []) {
                vulns.total++;
                const severity = finding.severity || 'info';
                if (vulns[severity] !== undefined) vulns[severity]++;
            }
        }

        // Security score calculation
        const securityScore = calculateSecurityScore(vulns);

        res.json({
            success: true,
            data: {
                servers: {
                    total: totalServers,
                    online: onlineServers,
                    offline: offlineServers,
                    warning: warningServers,
                    change: 2.5
                },
                monitors: {
                    total: totalMonitors,
                    up: upMonitors,
                    down: downMonitors,
                    warning: warningMonitors,
                    change: 1.2
                },
                alerts: {
                    total: totalAlerts,
                    active: activeAlerts,
                    critical: criticalAlerts,
                    high: highAlerts,
                    today: todayAlerts,
                    change: -5.6
                },
                vulns: {
                    total: vulns.total,
                    critical: vulns.critical,
                    high: vulns.high,
                    medium: vulns.medium,
                    low: vulns.low,
                    change: 3.8
                },
                scans: {
                    total: totalScans,
                    completed: completedScans,
                    running: runningScans,
                    failed: failedScans
                },
                security: {
                    score: securityScore,
                    level: getSecurityLevel(securityScore),
                    patched: Math.floor(vulns.total * 0.3),
                    in_progress: Math.floor(vulns.total * 0.4),
                    pending: Math.floor(vulns.total * 0.3)
                },
                trend: await generateTrendData(),
                recent_alerts: await getRecentAlerts(5)
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats',
            error: error.message
        });
    }
};

// Get uptime data
exports.getUptimeData = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const data = await generateUptimeData(days);
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching uptime data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch uptime data',
            error: error.message
        });
    }
};

// Get trend data
exports.getTrendData = async (req, res) => {
    try {
        const data = await generateTrendData();
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching trend data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trend data',
            error: error.message
        });
    }
};

// Helper functions
function calculateSecurityScore(vulns) {
    const total = vulns.total || 1;
    const weightedScore = (
        (vulns.critical || 0) * 10 +
        (vulns.high || 0) * 7 +
        (vulns.medium || 0) * 4 +
        (vulns.low || 0) * 1
    );
    const maxScore = total * 10;
    const percentage = 100 - (weightedScore / maxScore * 100);
    return Math.round(Math.max(0, Math.min(100, percentage)));
}

function getSecurityLevel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
}

async function generateTrendData() {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            uptime: 99.5 + (Math.random() * 0.5 - 0.25),
            alerts: Math.floor(Math.random() * 8),
            latency: 80 + Math.random() * 70,
            servers: 8 + Math.floor(Math.random() * 5)
        });
    }
    return data;
}

async function generateUptimeData(days) {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            uptime: 99.5 + (Math.random() * 0.5 - 0.25)
        });
    }
    return data;
}

async function getRecentAlerts(limit) {
    const alerts = await Alert.findAll({
        where: { status: 'triggered' },
        order: [['triggered_at', 'DESC']],
        limit: limit,
        include: [{
            model: Server,
            attributes: ['name']
        }]
    });

    return alerts.map(alert => ({
        id: alert.id,
        severity: alert.severity,
        message: alert.message,
        source: alert.source_type,
        time: getTimeAgo(alert.triggered_at),
        status: alert.status,
        server_name: alert.Server?.name || 'N/A'
    }));
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}
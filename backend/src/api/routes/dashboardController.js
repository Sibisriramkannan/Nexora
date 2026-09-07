const { Op } = require('sequelize');
const Server = require('../../models/Server');
const Monitor = require('../../models/Monitor');
const Alert = require('../../models/Alert');
const Scan = require('../../models/Scan');
const Metric = require('../../models/Metric');

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

        // Get recent alerts
        const recentAlerts = await Alert.findAll({
            where: { status: 'triggered' },
            order: [['triggered_at', 'DESC']],
            limit: 5,
            include: [{
                model: Server,
                attributes: ['name']
            }]
        });

        res.json({
            success: true,
            data: {
                servers: {
                    total: totalServers,
                    online: onlineServers,
                    offline: offlineServers,
                    warning: warningServers,
                    change: 0
                },
                monitors: {
                    total: totalMonitors,
                    up: upMonitors,
                    down: downMonitors,
                    warning: warningMonitors,
                    change: 0
                },
                alerts: {
                    total: totalAlerts,
                    active: activeAlerts,
                    critical: criticalAlerts,
                    high: highAlerts,
                    today: todayAlerts,
                    change: 0
                },
                vulns: {
                    total: vulns.total,
                    critical: vulns.critical,
                    high: vulns.high,
                    medium: vulns.medium,
                    low: vulns.low,
                    change: 0
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
                    patched: 0,
                    in_progress: 0,
                    pending: vulns.total
                },
                recent_alerts: recentAlerts.map(alert => ({
                    id: alert.id,
                    severity: alert.severity,
                    message: alert.message,
                    source: alert.source_type,
                    time: getTimeAgo(alert.triggered_at),
                    status: alert.status,
                    server_name: alert.Server?.name || 'N/A'
                })),
                trend: await generateTrendData()
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

async function getDailyTelemetry(days) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    const servers = await Server.count({ where: { agent_installed: true } });
    const metrics = await Metric.findAll({
        where: { timestamp: { [Op.gte]: start } },
        attributes: ['timestamp'],
        order: [['timestamp', 'ASC']],
        raw: true
    });

    const buckets = Array.from({ length: days }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return { date, count: 0 };
    });
    for (const metric of metrics) {
        const d = new Date(metric.timestamp);
        const index = Math.floor((d - start) / 86400000);
        if (index >= 0 && index < buckets.length) buckets[index].count++;
    }

    const expectedPerServer = Math.max(1, Math.floor(86400 / 30));
    return buckets.map(bucket => ({
        date: bucket.date.toLocaleDateString('en-US', { weekday: 'short' }),
        uptime: servers ? Math.min(100, Number(((bucket.count / (servers * expectedPerServer)) * 100).toFixed(2))) : 100,
        samples: bucket.count
    }));
}

async function generateTrendData() {
    const uptime = await getDailyTelemetry(7);
    const serverCount = await Server.count({ where: { agent_installed: true } });
    const data = uptime.map(day => ({ ...day, alerts: 0, latency: null, servers: serverCount }));
    const alerts = await Alert.findAll({
        where: { triggered_at: { [Op.gte]: (() => { const d = new Date(); d.setDate(d.getDate() - 6); d.setHours(0,0,0,0); return d; })() } },
        attributes: ['triggered_at'], raw: true
    });
    for (const alert of alerts) {
        const day = new Date(alert.triggered_at).toLocaleDateString('en-US', { weekday: 'short' });
        const row = data.find(item => item.date === day);
        if (row) row.alerts++;
    }
    return data;
}

async function generateUptimeData(days) {
    return getDailyTelemetry(days);
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}
const Monitor = require('../../models/Monitor');
const Server = require('../../models/Server');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Get all monitors
exports.getAllMonitors = async (req, res) => {
    try {
        const monitors = await Monitor.findAll({
            include: [{
                model: Server,
                attributes: ['name', 'ip_address', 'environment']
            }],
            order: [['created_at', 'DESC']]
        });
        res.json({
            success: true,
            data: monitors
        });
    } catch (error) {
        console.error('Error fetching monitors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch monitors',
            error: error.message
        });
    }
};

// Get monitor by ID
exports.getMonitorById = async (req, res) => {
    try {
        const monitor = await Monitor.findByPk(req.params.id, {
            include: [{
                model: Server,
                attributes: ['name', 'ip_address', 'environment']
            }]
        });
        if (!monitor) {
            return res.status(404).json({
                success: false,
                message: 'Monitor not found'
            });
        }
        res.json({
            success: true,
            data: monitor
        });
    } catch (error) {
        console.error('Error fetching monitor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch monitor',
            error: error.message
        });
    }
};

// Create monitor
exports.createMonitor = async (req, res) => {
    try {
        const monitorData = {
            ...req.body,
            id: uuidv4(),
            created_by: req.user.id
        };

        const monitor = await Monitor.create(monitorData);

        // Broadcast via WebSocket
        req.app.get('broadcastToRoom')('monitors', 'monitor_created', {
            monitor: monitor.toJSON()
        });

        res.status(201).json({
            success: true,
            data: monitor,
            message: 'Monitor created successfully'
        });
    } catch (error) {
        console.error('Error creating monitor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create monitor',
            error: error.message
        });
    }
};

// Update monitor
exports.updateMonitor = async (req, res) => {
    try {
        const monitor = await Monitor.findByPk(req.params.id);
        if (!monitor) {
            return res.status(404).json({
                success: false,
                message: 'Monitor not found'
            });
        }

        await monitor.update(req.body);

        // Broadcast via WebSocket
        req.app.get('broadcastToRoom')('monitors', 'monitor_updated', {
            monitor: monitor.toJSON()
        });

        res.json({
            success: true,
            data: monitor,
            message: 'Monitor updated successfully'
        });
    } catch (error) {
        console.error('Error updating monitor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update monitor',
            error: error.message
        });
    }
};

// Delete monitor
exports.deleteMonitor = async (req, res) => {
    try {
        const monitor = await Monitor.findByPk(req.params.id);
        if (!monitor) {
            return res.status(404).json({
                success: false,
                message: 'Monitor not found'
            });
        }

        await monitor.destroy();

        // Broadcast via WebSocket
        req.app.get('broadcastToRoom')('monitors', 'monitor_deleted', {
            monitor_id: req.params.id
        });

        res.json({
            success: true,
            message: 'Monitor deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting monitor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete monitor',
            error: error.message
        });
    }
};

// Test monitor
exports.testMonitor = async (req, res) => {
    try {
        const monitor = await Monitor.findByPk(req.params.id);
        if (!monitor) {
            return res.status(404).json({
                success: false,
                message: 'Monitor not found'
            });
        }

        const result = await checkMonitor(monitor);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error testing monitor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to test monitor',
            error: error.message
        });
    }
};

// Check monitor function
async function checkMonitor(monitor) {
    const start = Date.now();
    
    try {
        let response;
        switch (monitor.type) {
            case 'http':
            case 'https':
                response = await axios.get(monitor.target, {
                    timeout: monitor.timeout * 1000,
                    validateStatus: () => true
                });
                break;
            case 'ping':
                // Using ping - simplified for demo
                const pingResult = await require('child_process')
                    .execSync(`ping -c 1 ${monitor.target}`, { timeout: monitor.timeout * 1000 });
                response = { status: 200, data: 'OK' };
                break;
            case 'tcp':
                // TCP check - simplified
                const net = require('net');
                const socket = net.createConnection(monitor.port || 80, monitor.target);
                await new Promise((resolve, reject) => {
                    socket.on('connect', resolve);
                    socket.on('error', reject);
                    setTimeout(reject, monitor.timeout * 1000);
                });
                socket.destroy();
                response = { status: 200, data: 'Connected' };
                break;
            default:
                throw new Error(`Unsupported monitor type: ${monitor.type}`);
        }
        
        const responseTime = Date.now() - start;
        const isUp = response.status >= 200 && response.status < 400;
        
        return {
            status: isUp ? 'up' : 'down',
            status_code: response.status,
            response_time: responseTime,
            message: isUp ? 'Service is healthy' : `HTTP ${response.status}`,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        const responseTime = Date.now() - start;
        return {
            status: 'down',
            status_code: 0,
            response_time: responseTime,
            message: error.message || 'Connection failed',
            timestamp: new Date().toISOString()
        };
    }
}
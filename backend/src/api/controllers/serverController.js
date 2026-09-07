const Server = require('../../models/Server');
const Monitor = require('../../models/Monitor');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Get all servers
exports.getAllServers = async (req, res) => {
    try {
        const servers = await Server.findAll({
            order: [['created_at', 'DESC']]
        });
        res.json({
            success: true,
            data: servers
        });
    } catch (error) {
        console.error('Error fetching servers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch servers',
            error: error.message
        });
    }
};

// Get server by ID
exports.getServerById = async (req, res) => {
    try {
        const server = await Server.findByPk(req.params.id);
        if (!server) {
            return res.status(404).json({
                success: false,
                message: 'Server not found'
            });
        }
        
        const monitors = await Monitor.findAll({
            where: { server_id: server.id }
        });
        
        res.json({
            success: true,
            data: {
                ...server.toJSON(),
                monitors
            }
        });
    } catch (error) {
        console.error('Error fetching server:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch server',
            error: error.message
        });
    }
};

// Create server
exports.createServer = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const serverData = {
            ...req.body,
            id: uuidv4(),
            created_by: req.user.id
        };

        const server = await Server.create(serverData);

        // Auto-create basic monitors
        if (server.monitor_enabled) {
            await autoCreateMonitors(server);
        }

        // Broadcast via WebSocket
        req.app.get('broadcastToRoom')('servers', 'server_created', {
            server: server.toJSON()
        });

        res.status(201).json({
            success: true,
            data: server,
            message: 'Server created successfully'
        });
    } catch (error) {
        console.error('Error creating server:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create server',
            error: error.message
        });
    }
};

// Update server
exports.updateServer = async (req, res) => {
    try {
        const server = await Server.findByPk(req.params.id);
        if (!server) {
            return res.status(404).json({
                success: false,
                message: 'Server not found'
            });
        }

        await server.update(req.body);

        // Broadcast via WebSocket
        req.app.get('broadcastToRoom')('servers', 'server_updated', {
            server: server.toJSON()
        });

        res.json({
            success: true,
            data: server,
            message: 'Server updated successfully'
        });
    } catch (error) {
        console.error('Error updating server:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update server',
            error: error.message
        });
    }
};

// Delete server
exports.deleteServer = async (req, res) => {
    try {
        const server = await Server.findByPk(req.params.id);
        if (!server) {
            return res.status(404).json({
                success: false,
                message: 'Server not found'
            });
        }

        // Delete associated monitors
        await Monitor.destroy({
            where: { server_id: server.id }
        });

        await server.destroy();

        // Broadcast via WebSocket
        req.app.get('broadcastToRoom')('servers', 'server_deleted', {
            server_id: req.params.id
        });

        res.json({
            success: true,
            message: 'Server deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting server:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete server',
            error: error.message
        });
    }
};

// Bulk import servers
exports.bulkImportServers = async (req, res) => {
    try {
        const { servers } = req.body;
        const created = [];
        const errors = [];

        for (const serverData of servers) {
            try {
                const server = await Server.create({
                    ...serverData,
                    id: uuidv4(),
                    created_by: req.user.id
                });
                created.push(server);
                
                if (server.monitor_enabled) {
                    await autoCreateMonitors(server);
                }
            } catch (err) {
                errors.push({
                    server: serverData,
                    error: err.message
                });
            }
        }

        res.json({
            success: true,
            data: {
                created: created.length,
                errors: errors,
                servers: created
            },
            message: `Successfully imported ${created.length} servers`
        });
    } catch (error) {
        console.error('Error bulk importing servers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to import servers',
            error: error.message
        });
    }
};

// Helper functions
async function autoCreateMonitors(server) {
    const monitors = [
        {
            id: uuidv4(),
            name: `${server.name} - Ping`,
            type: 'ping',
            target: server.ip_address,
            interval: 60,
            server_id: server.id,
            created_by: server.created_by
        },
        {
            id: uuidv4(),
            name: `${server.name} - HTTP`,
            type: 'http',
            target: `http://${server.ip_address}`,
            interval: 60,
            server_id: server.id,
            created_by: server.created_by
        }
    ];

    for (const monitorData of monitors) {
        await Monitor.create(monitorData);
    }
}
const { v4: uuidv4 } = require('uuid');
const Server = require('../../models/Server');
const Scan = require('../../models/Scan');
const Alert = require('../../models/Alert');
const { networkScanner } = require('../../scanners/networkScanner');
const { webScanner } = require('../../scanners/webScanner');
const { complianceScanner } = require('../../scanners/complianceScanner');

// Get all scans
exports.getAllScans = async (req, res) => {
    try {
        const scans = await Scan.findAll({
            order: [['created_at', 'DESC']]
        });
        res.json({
            success: true,
            data: scans
        });
    } catch (error) {
        console.error('Error fetching scans:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scans',
            error: error.message
        });
    }
};

// Get scan by ID
exports.getScanById = async (req, res) => {
    try {
        const scan = await Scan.findByPk(req.params.id);
        if (!scan) {
            return res.status(404).json({
                success: false,
                message: 'Scan not found'
            });
        }
        res.json({
            success: true,
            data: scan
        });
    } catch (error) {
        console.error('Error fetching scan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scan',
            error: error.message
        });
    }
};

// Create new scan
exports.createScan = async (req, res) => {
    try {
        const { name, type, targets, options, schedule } = req.body;

        const scan = await Scan.create({
            id: uuidv4(),
            name,
            type,
            targets,
            options,
            schedule,
            status: 'pending',
            created_by: req.user.id
        });

        // Start scan immediately if not scheduled
        if (!schedule) {
            startScan(scan.id);
        }

        res.status(201).json({
            success: true,
            data: scan,
            message: 'Scan created successfully'
        });
    } catch (error) {
        console.error('Error creating scan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create scan',
            error: error.message
        });
    }
};

// Start scan
exports.startScan = async (req, res) => {
    try {
        const scan = await Scan.findByPk(req.params.id);
        if (!scan) {
            return res.status(404).json({
                success: false,
                message: 'Scan not found'
            });
        }

        if (scan.status === 'running') {
            return res.status(400).json({
                success: false,
                message: 'Scan is already running'
            });
        }

        await scan.update({ status: 'running', started_at: new Date() });
        startScan(scan.id);

        res.json({
            success: true,
            message: 'Scan started successfully'
        });
    } catch (error) {
        console.error('Error starting scan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start scan',
            error: error.message
        });
    }
};

// Cancel scan
exports.cancelScan = async (req, res) => {
    try {
        const scan = await Scan.findByPk(req.params.id);
        if (!scan) {
            return res.status(404).json({
                success: false,
                message: 'Scan not found'
            });
        }

        await scan.update({ status: 'cancelled' });

        res.json({
            success: true,
            message: 'Scan cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling scan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel scan',
            error: error.message
        });
    }
};

// Delete scan
exports.deleteScan = async (req, res) => {
    try {
        const scan = await Scan.findByPk(req.params.id);
        if (!scan) {
            return res.status(404).json({
                success: false,
                message: 'Scan not found'
            });
        }

        await scan.destroy();

        res.json({
            success: true,
            message: 'Scan deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting scan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete scan',
            error: error.message
        });
    }
};

// Get scan results
exports.getScanResults = async (req, res) => {
    try {
        const scan = await Scan.findByPk(req.params.id);
        if (!scan) {
            return res.status(404).json({
                success: false,
                message: 'Scan not found'
            });
        }

        const results = scan.results || {
            findings: [],
            summary: {
                total: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
            }
        };

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching scan results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scan results',
            error: error.message
        });
    }
};

// Start scan function
async function startScan(scanId) {
    try {
        const scan = await Scan.findByPk(scanId);
        if (!scan) return;

        // Update status
        await scan.update({ status: 'running', started_at: new Date() });

        // Execute scan based on type
        let results;
        switch (scan.type) {
            case 'network':
                results = await networkScanner.scan(scan.targets, scan.options);
                break;
            case 'web':
                results = await webScanner.scan(scan.targets, scan.options);
                break;
            case 'compliance':
                results = await complianceScanner.scan(scan.targets, scan.options);
                break;
            default:
                throw new Error(`Unknown scan type: ${scan.type}`);
        }

        // Save results
        await scan.update({
            status: 'completed',
            completed_at: new Date(),
            results: results
        });

        // Create alerts for critical findings
        for (const finding of results.findings) {
            if (finding.severity === 'critical' || finding.severity === 'high') {
                await Alert.create({
                    id: uuidv4(),
                    severity: finding.severity,
                    status: 'triggered',
                    source_type: 'scanner',
                    source_id: scan.id,
                    server_id: finding.server_id || null,
                    message: `${finding.cve_id || finding.type}: ${finding.description}`,
                    details: finding,
                    triggered_at: new Date()
                });
            }
        }

        // Broadcast via WebSocket
        const io = require('../../app').io;
        io.emit('scan_completed', {
            scan_id: scan.id,
            status: 'completed',
            findings: results.findings.length
        });

        console.log(`✅ Scan ${scanId} completed successfully`);
    } catch (error) {
        console.error(`❌ Scan ${scanId} failed:`, error);
        const scan = await Scan.findByPk(scanId);
        if (scan) {
            await scan.update({
                status: 'failed',
                completed_at: new Date(),
                error: error.message
            });
        }
    }
}

module.exports = exports;
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const Scan = require('../models/Scan');
const Alert = require('../models/Alert');
const alertService = require('./alertService');
const networkScanner = require('../scanners/networkScanner');
const webScanner = require('../scanners/webScanner');
const complianceScanner = require('../scanners/complianceScanner');
const cveMatcher = require('../scanners/cveMatcher');

class ScannerService {
    constructor() {
        this.scans = new Map();
        this.runningScans = new Map();
        this.isRunning = false;
    }

    // Initialize scanner
    async initialize() {
        try {
            // Initialize CVE matcher
            await cveMatcher.initialize();
            logger.info('✅ Scanner service initialized');
        } catch (error) {
            logger.error('❌ Scanner service initialization error:', error);
            throw error;
        }
    }

    // Create scan
    async createScan(scanData) {
        try {
            const scan = await Scan.create({
                id: uuidv4(),
                ...scanData,
                status: 'pending'
            });

            this.scans.set(scan.id, scan);

            // If no schedule, start immediately
            if (!scanData.schedule) {
                await this.startScan(scan.id);
            }

            logger.info(`✅ Scan created: ${scan.name}`);
            return scan;
        } catch (error) {
            logger.error('❌ Create scan error:', error);
            throw error;
        }
    }

    // Start scan
    async startScan(scanId) {
        try {
            const scan = await Scan.findByPk(scanId);
            if (!scan) {
                throw new Error('Scan not found');
            }

            if (scan.status === 'running') {
                throw new Error('Scan is already running');
            }

            // Update status
            await scan.update({
                status: 'running',
                started_at: new Date()
            });

            this.runningScans.set(scanId, {
                scan: scan,
                startTime: Date.now()
            });

            // Execute scan asynchronously
            this.executeScan(scanId).catch(error => {
                logger.error(`❌ Scan execution error: ${error.message}`);
            });

            logger.info(`🔄 Scan started: ${scan.name} (${scanId})`);
            return scan;
        } catch (error) {
            logger.error('❌ Start scan error:', error);
            throw error;
        }
    }

    // Execute scan
    async executeScan(scanId) {
        const scanEntry = this.runningScans.get(scanId);
        if (!scanEntry) return;

        const scan = scanEntry.scan;

        try {
            let results;

            // Execute based on scan type
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

            // Update scan results
            await scan.update({
                status: 'completed',
                completed_at: new Date(),
                results: results
            });

            // Process findings
            await this.processFindings(scan, results);

            // Create alerts for critical findings
            await this.createAlertsForFindings(scan, results);

            this.runningScans.delete(scanId);

            logger.info(`✅ Scan completed: ${scan.name} (${scanId})`);
        } catch (error) {
            await scan.update({
                status: 'failed',
                completed_at: new Date(),
                error: error.message
            });

            this.runningScans.delete(scanId);

            logger.error(`❌ Scan failed: ${scan.name} (${scanId})`, error);
        }
    }

    // Process findings
    async processFindings(scan, results) {
        const findings = results.findings || [];

        for (const finding of findings) {
            // Check if CVE exists
            if (finding.cve_id) {
                const cve = await cveMatcher.getCVEById(finding.cve_id);
                if (cve) {
                    finding.cvss_score = cve.cvss_score;
                    finding.severity = cve.cvss_severity;
                    finding.remediation = cve.remediation;
                    finding.description = cve.description;
                }
            }

            // Add server info if available
            if (finding.server_id) {
                // Get server details from database
                const Server = require('../models/Server');
                const server = await Server.findByPk(finding.server_id);
                if (server) {
                    finding.server_name = server.name;
                    finding.server_ip = server.ip_address;
                }
            }
        }
    }

    // Create alerts for findings
    async createAlertsForFindings(scan, results) {
        const findings = results.findings || [];

        for (const finding of findings) {
            const severity = finding.severity || 'info';

            if (severity === 'critical' || severity === 'high') {
                await alertService.processAlert({
                    severity: severity,
                    source_type: 'scanner',
                    source_id: scan.id,
                    server_id: finding.server_id || null,
                    message: `[${finding.cve_id || finding.type}] ${finding.description}`,
                    details: {
                        scan_name: scan.name,
                        scan_type: scan.type,
                        finding: finding,
                        remediation: finding.remediation
                    }
                });
            }
        }
    }

    // Cancel scan
    async cancelScan(scanId) {
        try {
            const scan = await Scan.findByPk(scanId);
            if (!scan) {
                throw new Error('Scan not found');
            }

            if (scan.status !== 'running') {
                throw new Error('Scan is not running');
            }

            await scan.update({
                status: 'cancelled',
                completed_at: new Date()
            });

            this.runningScans.delete(scanId);

            logger.info(`⏹️ Scan cancelled: ${scan.name} (${scanId})`);
            return scan;
        } catch (error) {
            logger.error('❌ Cancel scan error:', error);
            throw error;
        }
    }

    // Get scan status
    async getScanStatus(scanId) {
        const scan = this.runningScans.get(scanId);
        if (scan) {
            return {
                status: 'running',
                started_at: scan.scan.started_at,
                elapsed: Date.now() - scan.startTime
            };
        }

        const completed = await Scan.findByPk(scanId);
        if (completed) {
            return {
                status: completed.status,
                started_at: completed.started_at,
                completed_at: completed.completed_at,
                findings: completed.results?.findings?.length || 0
            };
        }

        return null;
    }

    // Get all scans
    async getAllScans() {
        return await Scan.findAll({
            order: [['created_at', 'DESC']]
        });
    }

    // Delete scan
    async deleteScan(scanId) {
        try {
            const scan = await Scan.findByPk(scanId);
            if (!scan) {
                throw new Error('Scan not found');
            }

            if (scan.status === 'running') {
                await this.cancelScan(scanId);
            }

            await scan.destroy();
            this.scans.delete(scanId);

            logger.info(`🗑️ Scan deleted: ${scanId}`);
            return true;
        } catch (error) {
            logger.error('❌ Delete scan error:', error);
            throw error;
        }
    }

    // Get scan results
    async getScanResults(scanId) {
        const scan = await Scan.findByPk(scanId);
        if (!scan) {
            throw new Error('Scan not found');
        }

        return {
            id: scan.id,
            name: scan.name,
            type: scan.type,
            status: scan.status,
            started_at: scan.started_at,
            completed_at: scan.completed_at,
            results: scan.results,
            error: scan.error
        };
    }

    // Get statistics
    async getStatistics() {
        const total = await Scan.count();
        const completed = await Scan.count({ where: { status: 'completed' } });
        const running = await Scan.count({ where: { status: 'running' } });
        const failed = await Scan.count({ where: { status: 'failed' } });
        const cancelled = await Scan.count({ where: { status: 'cancelled' } });

        // Get latest findings count
        const latestScans = await Scan.findAll({
            where: { status: 'completed' },
            order: [['created_at', 'DESC']],
            limit: 10
        });

        let totalFindings = 0;
        for (const scan of latestScans) {
            totalFindings += (scan.results?.findings || []).length;
        }

        return {
            total,
            completed,
            running,
            failed,
            cancelled,
            total_findings: totalFindings,
            avg_findings: latestScans.length > 0 ? totalFindings / latestScans.length : 0
        };
    }

    // Clean old scans
    async cleanOldScans(days = 30) {
        try {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);

            const count = await Scan.destroy({
                where: {
                    status: ['completed', 'failed', 'cancelled'],
                    created_at: { [require('sequelize').Op.lt]: cutoff }
                }
            });

            logger.info(`✅ Cleaned ${count} old scans`);
            return count;
        } catch (error) {
            logger.error('❌ Clean scans error:', error);
            throw error;
        }
    }
}

// Export singleton
const scannerService = new ScannerService();
module.exports = scannerService;
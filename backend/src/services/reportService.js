const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const Server = require('../models/Server');
const Monitor = require('../models/Monitor');
const Alert = require('../models/Alert');
const Scan = require('../models/Scan');

class ReportService {
    constructor() {
        this.reportsDir = path.join(__dirname, '../../reports');
        this.ensureReportsDirectory();
    }

    // Ensure reports directory exists
    ensureReportsDirectory() {
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
    }

    // Generate report
    async generateReport(options) {
        try {
            const { type, format, timeRange, include, email } = options;

            // Collect data based on report type
            let data;
            switch (type) {
                case 'uptime':
                    data = await this.generateUptimeReport(timeRange, include);
                    break;
                case 'security':
                    data = await this.generateSecurityReport(timeRange, include);
                    break;
                case 'compliance':
                    data = await this.generateComplianceReport(timeRange, include);
                    break;
                case 'performance':
                    data = await this.generatePerformanceReport(timeRange, include);
                    break;
                case 'sla':
                    data = await this.generateSLAReport(timeRange, include);
                    break;
                default:
                    throw new Error(`Unknown report type: ${type}`);
            }

            // Generate file
            const filename = `${type}_report_${Date.now()}`;
            let filePath;
            let mimeType;

            switch (format.toLowerCase()) {
                case 'pdf':
                    filePath = await this.generatePDF(data, filename);
                    mimeType = 'application/pdf';
                    break;
                case 'excel':
                    filePath = await this.generateExcel(data, filename);
                    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    break;
                case 'csv':
                    filePath = await this.generateCSV(data, filename);
                    mimeType = 'text/csv';
                    break;
                case 'html':
                    filePath = await this.generateHTML(data, filename);
                    mimeType = 'text/html';
                    break;
                case 'json':
                    filePath = await this.generateJSON(data, filename);
                    mimeType = 'application/json';
                    break;
                default:
                    throw new Error(`Unknown format: ${format}`);
            }

            // Send email if requested
            if (email) {
                await this.sendReportEmail(email, filePath, data.title);
            }

            logger.info(`✅ Report generated: ${filename}.${format}`);
            return {
                success: true,
                filename: path.basename(filePath),
                format: format,
                size: fs.statSync(filePath).size,
                path: filePath
            };
        } catch (error) {
            logger.error('❌ Report generation error:', error);
            throw error;
        }
    }

    // ==================== REPORT DATA GENERATORS ====================

    // Generate uptime report
    async generateUptimeReport(timeRange, include) {
        const servers = await Server.findAll();
        const monitors = await Monitor.findAll();

        // Calculate uptime statistics
        let totalUptime = 0;
        let totalMonitors = monitors.length;
        let upMonitors = 0;

        for (const monitor of monitors) {
            if (monitor.status === 'up') upMonitors++;
            totalUptime += monitor.uptime_percentage || 100;
        }

        const avgUptime = totalMonitors > 0 ? totalUptime / totalMonitors : 100;

        return {
            title: 'Uptime Report',
            generated: new Date().toISOString(),
            summary: {
                total_servers: servers.length,
                online_servers: servers.filter(s => s.status === 'online').length,
                total_monitors: totalMonitors,
                up_monitors: upMonitors,
                average_uptime: avgUptime.toFixed(2),
                overall_uptime: avgUptime.toFixed(2)
            },
            servers: servers.map(s => ({
                name: s.name,
                status: s.status,
                ip: s.ip_address,
                uptime: s.uptime || 0,
                cpu: s.cpu_usage || 0,
                memory: s.memory_usage || 0,
                disk: s.disk_usage || 0,
                last_seen: s.last_seen
            })),
            monitors: monitors.map(m => ({
                name: m.name,
                type: m.type,
                target: m.target,
                status: m.status,
                response_time: m.response_time || 0,
                uptime: m.uptime_percentage || 100,
                last_check: m.last_check
            })),
            trend: await this.getUptimeTrend()
        };
    }

    // Generate security report
    async generateSecurityReport(timeRange, include) {
        const scans = await Scan.findAll({
            where: { status: 'completed' },
            order: [['created_at', 'DESC']],
            limit: 20
        });

        const allFindings = [];
        for (const scan of scans) {
            const results = scan.results || { findings: [] };
            allFindings.push(...(results.findings || []));
        }

        // Group findings by severity
        const severityCount = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0
        };

        for (const finding of allFindings) {
            const severity = finding.severity || 'info';
            if (severityCount[severity] !== undefined) {
                severityCount[severity]++;
            }
        }

        // Get top vulnerabilities
        const topVulns = allFindings
            .filter(f => f.cve_id)
            .sort((a, b) => (b.cvss_score || 0) - (a.cvss_score || 0))
            .slice(0, 10);

        // Get affected servers
        const affectedServers = new Set();
        for (const finding of allFindings) {
            if (finding.server_id) {
                affectedServers.add(finding.server_id);
            }
        }

        return {
            title: 'Security Report',
            generated: new Date().toISOString(),
            summary: {
                total_scans: scans.length,
                total_findings: allFindings.length,
                critical: severityCount.critical,
                high: severityCount.high,
                medium: severityCount.medium,
                low: severityCount.low,
                affected_servers: affectedServers.size
            },
            findings: allFindings,
            top_vulnerabilities: topVulns,
            scans: scans.map(s => ({
                name: s.name,
                type: s.type,
                status: s.status,
                findings_count: (s.results?.findings || []).length,
                started_at: s.started_at,
                completed_at: s.completed_at
            })),
            trends: await this.getSecurityTrend()
        };
    }

    // Generate compliance report
    async generateComplianceReport(timeRange, include) {
        // Simulated compliance data
        return {
            title: 'Compliance Report',
            generated: new Date().toISOString(),
            summary: {
                pci_dss: {
                    status: 'partial',
                    passed: 8,
                    failed: 2,
                    total: 10
                },
                hipaa: {
                    status: 'non-compliant',
                    passed: 5,
                    failed: 5,
                    total: 10
                },
                gdpr: {
                    status: 'compliant',
                    passed: 10,
                    failed: 0,
                    total: 10
                },
                cis: {
                    status: 'partial',
                    passed: 6,
                    failed: 4,
                    total: 10
                }
            },
            details: {
                pci_dss: {
                    controls: [
                        { id: '1.1', name: 'Firewall Configuration', status: 'passed' },
                        { id: '1.2', name: 'Network Security', status: 'passed' },
                        { id: '2.1', name: 'Default Passwords', status: 'failed' },
                        { id: '3.1', name: 'Data Encryption', status: 'passed' },
                        { id: '3.2', name: 'Data Storage', status: 'failed' },
                        { id: '7.1', name: 'Access Control', status: 'passed' },
                        { id: '10.1', name: 'Audit Logging', status: 'passed' }
                    ]
                },
                hipaa: {
                    controls: [
                        { id: '164.312(a)', name: 'Access Controls', status: 'failed' },
                        { id: '164.312(e)', name: 'Data Encryption', status: 'passed' },
                        { id: '164.312(b)', name: 'Audit Controls', status: 'failed' },
                        { id: '164.308', name: 'Security Management', status: 'passed' }
                    ]
                },
                gdpr: {
                    controls: [
                        { id: 'Article 32', name: 'Data Protection', status: 'passed' },
                        { id: 'Article 13', name: 'Privacy Policy', status: 'passed' },
                        { id: 'Article 33', name: 'Breach Notification', status: 'passed' }
                    ]
                }
            },
            recommendations: [
                'Update default passwords on all systems',
                'Implement proper data encryption for storage',
                'Enhance access control policies',
                'Review and update HIPAA compliance measures'
            ]
        };
    }

    // Generate performance report
    async generatePerformanceReport(timeRange, include) {
        const servers = await Server.findAll();
        const monitors = await Monitor.findAll();

        let totalCpu = 0;
        let totalMemory = 0;
        let totalDisk = 0;
        let totalResponse = 0;

        for (const server of servers) {
            totalCpu += server.cpu_usage || 0;
            totalMemory += server.memory_usage || 0;
            totalDisk += server.disk_usage || 0;
        }

        for (const monitor of monitors) {
            totalResponse += monitor.response_time || 0;
        }

        const avgCpu = servers.length > 0 ? totalCpu / servers.length : 0;
        const avgMemory = servers.length > 0 ? totalMemory / servers.length : 0;
        const avgDisk = servers.length > 0 ? totalDisk / servers.length : 0;
        const avgResponse = monitors.length > 0 ? totalResponse / monitors.length : 0;

        return {
            title: 'Performance Report',
            generated: new Date().toISOString(),
            summary: {
                avg_cpu: avgCpu.toFixed(1),
                avg_memory: avgMemory.toFixed(1),
                avg_disk: avgDisk.toFixed(1),
                avg_response_time: avgResponse.toFixed(0),
                total_servers: servers.length,
                total_monitors: monitors.length
            },
            servers: servers.map(s => ({
                name: s.name,
                cpu: s.cpu_usage || 0,
                memory: s.memory_usage || 0,
                disk: s.disk_usage || 0,
                status: s.status
            })),
            monitors: monitors.map(m => ({
                name: m.name,
                type: m.type,
                target: m.target,
                response_time: m.response_time || 0,
                status: m.status
            })),
            trends: await this.getPerformanceTrend()
        };
    }

    // Generate SLA report
    async generateSLAReport(timeRange, include) {
        const servers = await Server.findAll();
        const monitors = await Monitor.findAll();

        let totalSLA = 0;
        let slaLabels = [];

        for (const monitor of monitors) {
            const uptime = monitor.uptime_percentage || 100;
            totalSLA += uptime;
            slaLabels.push({
                name: monitor.name,
                uptime: uptime,
                sla_target: 99.9,
                achieved: uptime >= 99.9
            });
        }

        const avgSLA = monitors.length > 0 ? totalSLA / monitors.length : 0;

        return {
            title: 'SLA Report',
            generated: new Date().toISOString(),
            summary: {
                total_services: monitors.length,
                average_uptime: avgSLA.toFixed(2),
                sla_achieved: slaLabels.filter(s => s.achieved).length,
                sla_achievement_rate: monitors.length > 0 
                    ? (slaLabels.filter(s => s.achieved).length / monitors.length * 100).toFixed(1)
                    : 0
            },
            services: slaLabels,
            servers: servers.map(s => ({
                name: s.name,
                uptime: s.uptime || 0,
                status: s.status
            }))
        };
    }

    // ==================== TREND DATA ====================

    async getUptimeTrend() {
        const data = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                uptime: 99.5 + (Math.random() * 0.5 - 0.25)
            });
        }
        return data;
    }

    async getSecurityTrend() {
        const data = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                critical: Math.floor(Math.random() * 3),
                high: Math.floor(Math.random() * 5),
                medium: Math.floor(Math.random() * 8),
                low: Math.floor(Math.random() * 10)
            });
        }
        return data;
    }

    async getPerformanceTrend() {
        const data = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                response_time: 100 + Math.random() * 50,
                cpu: 30 + Math.random() * 30,
                memory: 40 + Math.random() * 30
            });
        }
        return data;
    }

    // ==================== FILE GENERATORS ====================

    // Generate PDF
    async generatePDF(data, filename) {
        const filePath = path.join(this.reportsDir, `${filename}.pdf`);
        const doc = new PDFDocument({ margin: 50 });

        return new Promise((resolve, reject) => {
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            try {
                // Header
                doc.fontSize(24)
                    .fillColor('#6C63FF')
                    .text('Nexora', { align: 'center' });
                doc.fontSize(14)
                    .fillColor('#333')
                    .text(data.title, { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(10)
                    .fillColor('#666')
                    .text(`Generated: ${data.generated}`, { align: 'center' });
                doc.moveDown();

                // Summary
                doc.fontSize(16)
                    .fillColor('#333')
                    .text('Summary', { underline: true });
                doc.moveDown(0.5);

                const summary = data.summary || {};
                for (const [key, value] of Object.entries(summary)) {
                    if (typeof value !== 'object') {
                        doc.fontSize(12)
                            .fillColor('#444')
                            .text(`${key.replace(/_/g, ' ').toUpperCase()}: ${value}`);
                    }
                }
                doc.moveDown();

                // Add tables for arrays
                for (const [key, value] of Object.entries(data)) {
                    if (key !== 'title' && key !== 'generated' && key !== 'summary' && Array.isArray(value) && value.length > 0) {
                        doc.addPage();
                        doc.fontSize(14)
                            .fillColor('#333')
                            .text(key.replace(/_/g, ' ').toUpperCase(), { underline: true });
                        doc.moveDown(0.5);

                        const headers = Object.keys(value[0]);
                        const columnWidths = headers.map(() => 120);

                        // Table header
                        let x = 50;
                        doc.fontSize(10)
                            .fillColor('#6C63FF');
                        for (const header of headers) {
                            doc.text(header.replace(/_/g, ' ').toUpperCase(), x, doc.y, { width: columnWidths[headers.indexOf(header)], align: 'left' });
                            x += columnWidths[headers.indexOf(header)];
                        }
                        doc.moveDown();

                        // Table rows
                        for (const item of value) {
                            x = 50;
                            doc.fontSize(9)
                                .fillColor('#333');
                            for (const header of headers) {
                                const val = item[header] || 'N/A';
                                doc.text(String(val), x, doc.y, { width: columnWidths[headers.indexOf(header)], align: 'left' });
                                x += columnWidths[headers.indexOf(header)];
                            }
                            doc.moveDown();
                        }
                    }
                }

                // Footer
                doc.fontSize(8)
                    .fillColor('#999')
                    .text('Confidential - Generated by Nexora v1.0.0', 50, doc.page.height - 50, { align: 'center' });

                doc.end();

                stream.on('finish', () => {
                    resolve(filePath);
                });

                stream.on('error', (error) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Generate Excel
    async generateExcel(data, filename) {
        const filePath = path.join(this.reportsDir, `${filename}.xlsx`);
        const workbook = new ExcelJS.Workbook();

        // Summary sheet
        const summarySheet = workbook.addWorksheet('Summary');
        summarySheet.addRow(['Key', 'Value']);
        const summary = data.summary || {};
        for (const [key, value] of Object.entries(summary)) {
            if (typeof value !== 'object') {
                summarySheet.addRow([key.replace(/_/g, ' ').toUpperCase(), value]);
            }
        }

        // Data sheets
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'title' && key !== 'generated' && key !== 'summary' && Array.isArray(value) && value.length > 0) {
                const sheet = workbook.addWorksheet(key.replace(/_/g, ' ').toUpperCase());
                const headers = Object.keys(value[0]);
                sheet.addRow(headers.map(h => h.replace(/_/g, ' ').toUpperCase()));

                for (const item of value) {
                    sheet.addRow(headers.map(h => item[h] || ''));
                }
            }
        }

        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }

    // Generate CSV
    async generateCSV(data, filename) {
        const filePath = path.join(this.reportsDir, `${filename}.csv`);
        const stream = fs.createWriteStream(filePath);

        // Find first array to use
        let arrayData = [];
        let arrayKey = '';
        for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value) && value.length > 0) {
                arrayData = value;
                arrayKey = key;
                break;
            }
        }

        if (arrayData.length > 0) {
            const headers = Object.keys(arrayData[0]);
            stream.write(headers.join(',') + '\n');

            for (const item of arrayData) {
                const row = headers.map(h => {
                    const val = item[h] || '';
                    return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
                });
                stream.write(row.join(',') + '\n');
            }
        }

        stream.end();
        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        });
    }

    // Generate HTML
    async generateHTML(data, filename) {
        const filePath = path.join(this.reportsDir, `${filename}.html`);
        let html = `<!DOCTYPE html>
<html>
<head>
    <title>Nexora Report - ${data.title}</title>
    <style>
        body { font-family: Arial, sans-serif; background: #0A0A1A; color: #fff; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #6C63FF; padding-bottom: 20px; }
        .title { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #6C63FF, #00D4FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { color: #888; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .summary-card { background: #1a1a2e; padding: 20px; border-radius: 12px; border: 1px solid #333; text-align: center; }
        .summary-value { font-size: 28px; font-weight: bold; color: #6C63FF; }
        .summary-label { color: #888; font-size: 14px; }
        .section { margin: 30px 0; }
        .section-title { font-size: 20px; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #333; }
        th { background: #1a1a2e; color: #6C63FF; }
        td { color: #ddd; }
        .footer { text-align: center; color: #666; font-size: 12px; border-top: 1px solid #333; padding-top: 20px; margin-top: 40px; }
        .status-passed { color: #00C9A7; }
        .status-failed { color: #FF6B6B; }
        .status-partial { color: #FFD93D; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">Nexora</div>
            <div class="subtitle">${data.title}</div>
            <div style="font-size: 12px; color: #666;">Generated: ${data.generated}</div>
        </div>`;

        // Summary
        if (data.summary) {
            html += `<div class="summary">`;
            for (const [key, value] of Object.entries(data.summary)) {
                if (typeof value !== 'object') {
                    html += `
                        <div class="summary-card">
                            <div class="summary-value">${value}</div>
                            <div class="summary-label">${key.replace(/_/g, ' ').toUpperCase()}</div>
                        </div>
                    `;
                }
            }
            html += `</div>`;
        }

        // Tables
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'title' && key !== 'generated' && key !== 'summary' && Array.isArray(value) && value.length > 0) {
                html += `
                    <div class="section">
                        <div class="section-title">${key.replace(/_/g, ' ').toUpperCase()}</div>
                        <table>
                            <thead>
                                <tr>`;
                const headers = Object.keys(value[0]);
                for (const header of headers) {
                    html += `<th>${header.replace(/_/g, ' ').toUpperCase()}</th>`;
                }
                html += `</tr></thead><tbody>`;
                for (const item of value) {
                    html += `<tr>`;
                    for (const header of headers) {
                        const val = item[header] || '';
                        if (typeof val === 'string' && val.includes('passed')) {
                            html += `<td class="status-passed">${val}</td>`;
                        } else if (typeof val === 'string' && val.includes('failed')) {
                            html += `<td class="status-failed">${val}</td>`;
                        } else if (typeof val === 'string' && val.includes('partial')) {
                            html += `<td class="status-partial">${val}</td>`;
                        } else {
                            html += `<td>${val}</td>`;
                        }
                    }
                    html += `</tr>`;
                }
                html += `</tbody></table></div>`;
            }
        }

        html += `
        <div class="footer">
            <p>Nexora - Next-Gen Observability Platform</p>
            <p>Confidential - Generated by Nexora v1.0.0</p>
        </div>
    </div>
</body>
</html>`;

        fs.writeFileSync(filePath, html);
        return filePath;
    }

    // Generate JSON
    async generateJSON(data, filename) {
        const filePath = path.join(this.reportsDir, `${filename}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return filePath;
    }

    // Send report email
    async sendReportEmail(email, filePath, title) {
        try {
            const emailService = require('./emailService');
            const fs = require('fs');
            const path = require('path');

            const attachments = [{
                filename: path.basename(filePath),
                path: filePath
            }];

            await emailService.sendEmail({
                to: email,
                subject: `📊 Nexora Report: ${title}`,
                html: `
                    <h1>Nexora Report</h1>
                    <p>Your report <strong>${title}</strong> has been generated.</p>
                    <p>Generated at: ${new Date().toLocaleString()}</p>
                    <p>Please find the report attached.</p>
                    <hr>
                    <p style="color: #888; font-size: 12px;">This is an automated email from Nexora.</p>
                `,
                attachments: attachments
            });

            logger.info(`✅ Report email sent to ${email}`);
        } catch (error) {
            logger.error('❌ Report email error:', error);
            throw error;
        }
    }

    // Get report by ID
    async getReportById(reportId) {
        try {
            const files = fs.readdirSync(this.reportsDir);
            const file = files.find(f => f.includes(reportId));
            if (!file) {
                throw new Error('Report not found');
            }
            return {
                filename: file,
                path: path.join(this.reportsDir, file),
                size: fs.statSync(path.join(this.reportsDir, file)).size
            };
        } catch (error) {
            logger.error('❌ Get report error:', error);
            throw error;
        }
    }

    // Delete report
    async deleteReport(reportId) {
        try {
            const files = fs.readdirSync(this.reportsDir);
            const file = files.find(f => f.includes(reportId));
            if (file) {
                fs.unlinkSync(path.join(this.reportsDir, file));
                logger.info(`✅ Report deleted: ${file}`);
                return true;
            }
            return false;
        } catch (error) {
            logger.error('❌ Delete report error:', error);
            throw error;
        }
    }

    // Clean old reports
    async cleanOldReports(days = 30) {
        try {
            const files = fs.readdirSync(this.reportsDir);
            const now = Date.now();
            let deleted = 0;

            for (const file of files) {
                const filePath = path.join(this.reportsDir, file);
                const stats = fs.statSync(filePath);
                const age = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

                if (age > days) {
                    fs.unlinkSync(filePath);
                    deleted++;
                }
            }

            logger.info(`✅ Cleaned ${deleted} old reports`);
            return deleted;
        } catch (error) {
            logger.error('❌ Clean reports error:', error);
            throw error;
        }
    }
}

// Export singleton
const reportService = new ReportService();
module.exports = reportService;
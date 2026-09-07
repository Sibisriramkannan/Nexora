const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { formatBytes, formatDuration } = require('../../utils/helpers');
const Server = require('../../models/Server');
const Monitor = require('../../models/Monitor');
const Alert = require('../../models/Alert');
const Scan = require('../../models/Scan');

// Get all reports
exports.getAllReports = async (req, res) => {
    try {
        // For demo, return available report types
        const reportTypes = [
            {
                id: 'uptime',
                name: 'Uptime Report',
                description: 'Server and service uptime statistics',
                formats: ['PDF', 'Excel', 'CSV']
            },
            {
                id: 'security',
                name: 'Security Report',
                description: 'Vulnerability and security findings',
                formats: ['PDF', 'CSV', 'HTML']
            },
            {
                id: 'compliance',
                name: 'Compliance Report',
                description: 'Compliance status (PCI-DSS, HIPAA, GDPR)',
                formats: ['PDF', 'Excel', 'JSON']
            },
            {
                id: 'performance',
                name: 'Performance Report',
                description: 'Response time and performance metrics',
                formats: ['PDF', 'Excel', 'CSV']
            },
            {
                id: 'sla',
                name: 'SLA Report',
                description: 'Service Level Agreement compliance',
                formats: ['PDF', 'Excel']
            }
        ];

        res.json({
            success: true,
            data: reportTypes
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports',
            error: error.message
        });
    }
};

// Generate report
exports.generateReport = async (req, res) => {
    try {
        const { type, format, timeRange, include } = req.body;

        let reportData;
        let filename;

        switch (type) {
            case 'uptime':
                reportData = await generateUptimeReport(timeRange, include);
                filename = `uptime_report_${Date.now()}`;
                break;
            case 'security':
                reportData = await generateSecurityReport(timeRange, include);
                filename = `security_report_${Date.now()}`;
                break;
            case 'compliance':
                reportData = await generateComplianceReport(timeRange, include);
                filename = `compliance_report_${Date.now()}`;
                break;
            case 'performance':
                reportData = await generatePerformanceReport(timeRange, include);
                filename = `performance_report_${Date.now()}`;
                break;
            case 'sla':
                reportData = await generateSLAReport(timeRange, include);
                filename = `sla_report_${Date.now()}`;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type'
                });
        }

        // Generate file based on format
        let filePath;
        let mimeType;

        switch (format.toLowerCase()) {
            case 'pdf':
                filePath = await generatePDF(reportData, filename);
                mimeType = 'application/pdf';
                break;
            case 'excel':
                filePath = await generateExcel(reportData, filename);
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case 'csv':
                filePath = await generateCSV(reportData, filename);
                mimeType = 'text/csv';
                break;
            case 'json':
                filePath = await generateJSON(reportData, filename);
                mimeType = 'application/json';
                break;
            case 'html':
                filePath = await generateHTML(reportData, filename);
                mimeType = 'text/html';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid format'
                });
        }

        res.json({
            success: true,
            data: {
                filename: path.basename(filePath),
                format: format,
                size: fs.statSync(filePath).size,
                download_url: `/api/reports/download/${path.basename(filePath)}`
            },
            message: 'Report generated successfully'
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report',
            error: error.message
        });
    }
};

// Download report
exports.downloadReport = async (req, res) => {
    try {
        const filename = req.params.id;
        const filePath = path.join(__dirname, '../../reports', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.download(filePath);
    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download report',
            error: error.message
        });
    }
};

// Schedule report
exports.scheduleReport = async (req, res) => {
    try {
        const { type, format, timeRange, email, schedule } = req.body;

        // Save schedule to database
        // For demo, just return success

        res.json({
            success: true,
            message: 'Report scheduled successfully',
            data: {
                type,
                format,
                schedule,
                email
            }
        });
    } catch (error) {
        console.error('Error scheduling report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to schedule report',
            error: error.message
        });
    }
};

// ==================== REPORT GENERATORS ====================

async function generateUptimeReport(timeRange, include) {
    const servers = await Server.findAll();
    const monitors = await Monitor.findAll();

    return {
        title: 'Uptime Report',
        generated: new Date().toISOString(),
        summary: {
            total_servers: servers.length,
            online_servers: servers.filter(s => s.status === 'online').length,
            total_monitors: monitors.length,
            up_monitors: monitors.filter(m => m.status === 'up').length,
            overall_uptime: 99.8
        },
        servers: servers.map(s => ({
            name: s.name,
            status: s.status,
            uptime: s.uptime || 0,
            cpu: s.cpu_usage || 0,
            memory: s.memory_usage || 0
        })),
        monitors: monitors.map(m => ({
            name: m.name,
            type: m.type,
            target: m.target,
            status: m.status,
            response_time: m.response_time || 0,
            uptime: m.uptime_percentage || 100
        }))
    };
}

async function generateSecurityReport(timeRange, include) {
    const scans = await Scan.findAll({
        where: {
            status: 'completed'
        },
        order: [['created_at', 'DESC']],
        limit: 10
    });

    const findings = scans.reduce((acc, scan) => {
        const results = scan.results || { findings: [] };
        return acc.concat(results.findings || []);
    }, []);

    return {
        title: 'Security Report',
        generated: new Date().toISOString(),
        summary: {
            total_scans: scans.length,
            total_findings: findings.length,
            critical: findings.filter(f => f.severity === 'critical').length,
            high: findings.filter(f => f.severity === 'high').length,
            medium: findings.filter(f => f.severity === 'medium').length,
            low: findings.filter(f => f.severity === 'low').length
        },
        scans: scans.map(s => ({
            name: s.name,
            type: s.type,
            status: s.status,
            findings: (s.results?.findings || []).length,
            completed_at: s.completed_at
        })),
        top_vulnerabilities: findings.slice(0, 10).map(f => ({
            cve: f.cve_id || 'N/A',
            severity: f.severity,
            description: f.description,
            remediation: f.remediation
        }))
    };
}

async function generateComplianceReport(timeRange, include) {
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
            }
        },
        details: {
            pci_dss: {
                controls: [
                    { id: '1.1', name: 'Firewall Configuration', status: 'passed' },
                    { id: '1.2', name: 'Network Security', status: 'passed' },
                    { id: '2.1', name: 'Default Passwords', status: 'failed' },
                    { id: '3.1', name: 'Data Encryption', status: 'passed' },
                    { id: '3.2', name: 'Data Storage', status: 'failed' }
                ]
            },
            hipaa: {
                controls: [
                    { id: '1', name: 'Access Controls', status: 'failed' },
                    { id: '2', name: 'Data Encryption', status: 'passed' },
                    { id: '3', name: 'Audit Logs', status: 'failed' }
                ]
            },
            gdpr: {
                controls: [
                    { id: '1', name: 'Data Protection', status: 'passed' },
                    { id: '2', name: 'Privacy Policy', status: 'passed' },
                    { id: '3', name: 'Data Breach Notification', status: 'passed' }
                ]
            }
        }
    };
}

async function generatePerformanceReport(timeRange, include) {
    const servers = await Server.findAll();
    const monitors = await Monitor.findAll();

    return {
        title: 'Performance Report',
        generated: new Date().toISOString(),
        summary: {
            avg_cpu: servers.reduce((acc, s) => acc + (s.cpu_usage || 0), 0) / (servers.length || 1),
            avg_memory: servers.reduce((acc, s) => acc + (s.memory_usage || 0), 0) / (servers.length || 1),
            avg_response: monitors.reduce((acc, m) => acc + (m.response_time || 0), 0) / (monitors.length || 1)
        },
        servers: servers.map(s => ({
            name: s.name,
            cpu: s.cpu_usage || 0,
            memory: s.memory_usage || 0,
            disk: s.disk_usage || 0
        })),
        monitors: monitors.map(m => ({
            name: m.name,
            type: m.type,
            target: m.target,
            response_time: m.response_time || 0
        }))
    };
}

async function generateSLAReport(timeRange, include) {
    return {
        title: 'SLA Report',
        generated: new Date().toISOString(),
        summary: {
            total_services: 10,
            sla_achieved: 8,
            sla_achievement_rate: 80,
            avg_uptime: 99.8,
            avg_response_time: 150
        },
        services: [
            { name: 'API Gateway', uptime: 99.99, sla_target: 99.9, achieved: true },
            { name: 'Authentication Service', uptime: 99.95, sla_target: 99.9, achieved: true },
            { name: 'Payment Processing', uptime: 99.50, sla_target: 99.9, achieved: false },
            { name: 'Database Cluster', uptime: 99.98, sla_target: 99.9, achieved: true }
        ]
    };
}

// ==================== FILE GENERATORS ====================

async function generatePDF(data, filename) {
    const dir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${filename}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(24).text('Nexora Report', { align: 'center' });
    doc.fontSize(14).text(data.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${data.generated}`, { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(16).text('Summary', { underline: true });
    doc.moveDown();

    const summary = data.summary || {};
    const summaryItems = Object.entries(summary);
    for (const [key, value] of summaryItems) {
        doc.fontSize(12).text(`${key.replace(/_/g, ' ').toUpperCase()}: ${value}`);
    }

    doc.moveDown();
    doc.fontSize(16).text('Details', { underline: true });
    doc.moveDown();

    // Add more content based on data structure
    for (const [key, value] of Object.entries(data)) {
        if (key !== 'title' && key !== 'generated' && key !== 'summary' && Array.isArray(value)) {
            doc.fontSize(14).text(key.replace(/_/g, ' ').toUpperCase());
            doc.moveDown(0.5);
            
            for (const item of value) {
                const itemStr = Object.entries(item)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' | ');
                doc.fontSize(10).text(`• ${itemStr}`);
            }
            doc.moveDown();
        }
    }

    doc.end();

    // Wait for stream to finish
    await new Promise((resolve) => {
        stream.on('finish', resolve);
    });

    return filePath;
}

async function generateExcel(data, filename) {
    const dir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${filename}.xlsx`);
    const workbook = new ExcelJS.Workbook();
    
    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Key', 'Value']);
    const summary = data.summary || {};
    for (const [key, value] of Object.entries(summary)) {
        summarySheet.addRow([key.replace(/_/g, ' ').toUpperCase(), value]);
    }

    // Add sheets for each array
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

async function generateCSV(data, filename) {
    const dir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${filename}.csv`);
    const stream = fs.createWriteStream(filePath);

    // Find first array to use as data
    let arrayData = [];
    for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value) && value.length > 0) {
            arrayData = value;
            break;
        }
    }

    if (arrayData.length > 0) {
        const headers = Object.keys(arrayData[0]);
        stream.write(headers.join(',') + '\n');
        
        for (const item of arrayData) {
            const row = headers.map(h => {
                const val = item[h] || '';
                return typeof val === 'string' ? `"${val}"` : val;
            });
            stream.write(row.join(',') + '\n');
        }
    }

    stream.end();
    await new Promise((resolve) => {
        stream.on('finish', resolve);
    });

    return filePath;
}

async function generateJSON(data, filename) {
    const dir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return filePath;
}

async function generateHTML(data, filename) {
    const dir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${filename}.html`);
    
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
            html += `
                <div class="summary-card">
                    <div class="summary-value">${value}</div>
                    <div class="summary-label">${key.replace(/_/g, ' ').toUpperCase()}</div>
                </div>
            `;
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
                    html += `<td>${item[header] || ''}</td>`;
                }
                html += `</tr>`;
            }
            html += `</tbody></table></div>`;
        }
    }

    html += `
        <div class="footer">
            <p>Nexora - Next-Gen Observability Platform</p>
            <p>Generated by Nexora v1.0.0</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(filePath, html);
    return filePath;
}
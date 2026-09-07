const nmap = require('node-nmap');
const axios = require('axios');

class NetworkScanner {
    constructor() {
        this.findings = [];
    }

    async scan(targets, options = {}) {
        console.log(`🔍 Starting network scan for ${targets.length} targets`);
        this.findings = [];

        for (const target of targets) {
            try {
                await this.scanTarget(target, options);
            } catch (error) {
                console.error(`Error scanning ${target}:`, error.message);
            }
        }

        return {
            findings: this.findings,
            summary: this.getSummary()
        };
    }

    async scanTarget(target, options) {
        // Port scan
        const ports = options.ports || '1-1000';
        const scan = new nmap.NmapScan(target, ports);

        return new Promise((resolve, reject) => {
            scan.on('complete', (data) => {
                this.processScanResults(target, data);
                resolve(data);
            });

            scan.on('error', (error) => {
                reject(error);
            });

            scan.startScan();
        });
    }

    processScanResults(target, results) {
        if (!results || !results[0]) return;

        const host = results[0];
        
        // Check for open ports
        for (const port of host.openPorts || []) {
            const service = port.service || 'unknown';
            const version = port.version || '';
            
            // Check for known vulnerabilities
            this.checkVulnerabilities(target, port.port, service, version);
        }

        // OS detection
        if (host.os) {
            this.findings.push({
                type: 'os_detection',
                server_id: target,
                os: host.os,
                severity: 'info',
                description: `Detected OS: ${host.os}`,
                timestamp: new Date().toISOString()
            });
        }
    }

    checkVulnerabilities(target, port, service, version) {
        // Common vulnerable services
        const vulns = {
            'ssh': {
                '7.4': { cve: 'CVE-2017-15906', severity: 'high' },
                '7.2': { cve: 'CVE-2016-6210', severity: 'high' }
            },
            'nginx': {
                '1.16': { cve: 'CVE-2019-9511', severity: 'high' },
                '1.14': { cve: 'CVE-2018-16843', severity: 'medium' }
            },
            'apache': {
                '2.4.39': { cve: 'CVE-2019-10098', severity: 'high' },
                '2.4.38': { cve: 'CVE-2019-0211', severity: 'critical' }
            }
        };

        if (vulns[service] && vulns[service][version]) {
            const vuln = vulns[service][version];
            this.findings.push({
                type: 'service_vulnerability',
                server_id: target,
                port: port,
                service: service,
                version: version,
                cve_id: vuln.cve,
                severity: vuln.severity,
                description: `${service} ${version} has known vulnerability ${vuln.cve}`,
                remediation: `Upgrade ${service} to latest version`,
                timestamp: new Date().toISOString()
            });
        }
    }

    getSummary() {
        const summary = {
            total: this.findings.length,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0
        };

        for (const finding of this.findings) {
            const severity = finding.severity || 'info';
            if (summary[severity] !== undefined) {
                summary[severity]++;
            }
        }

        return summary;
    }
}

const networkScanner = new NetworkScanner();
module.exports = { networkScanner };
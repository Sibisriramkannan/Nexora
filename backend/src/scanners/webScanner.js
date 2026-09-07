const axios = require('axios');

class WebScanner {
    constructor() {
        this.findings = [];
        this.payloads = {
            sql_injection: [
                "' OR '1'='1",
                "'; DROP TABLE users--",
                "' UNION SELECT NULL--",
                "' AND 1=1--",
                "1' OR '1' = '1"
            ],
            xss: [
                "<script>alert('XSS')</script>",
                "<img src=x onerror=alert(1)>",
                "javascript:alert('XSS')",
                "<script>alert('XSS')</script>",
                "<svg onload=alert('XSS')>"
            ],
            path_traversal: [
                "../../etc/passwd",
                "../../../windows/win.ini",
                "..\\..\\..\\windows\\win.ini",
                "%2e%2e%2fetc%2fpasswd"
            ]
        };
    }

    async scan(targets, options = {}) {
        console.log(`🔍 Starting web scan for ${targets.length} targets`);
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
        const urls = this.getUrls(target);
        
        for (const url of urls) {
            try {
                // Check if site is up
                await this.checkSiteHealth(url);
                
                // Test for SQL Injection
                await this.testSQLInjection(url);
                
                // Test for XSS
                await this.testXSS(url);
                
                // Test for Path Traversal
                await this.testPathTraversal(url);
                
                // Check SSL/TLS
                await this.checkSSL(url);
                
            } catch (error) {
                console.error(`Error scanning ${url}:`, error.message);
            }
        }
    }

    getUrls(target) {
        const urls = [];
        if (target.startsWith('http://') || target.startsWith('https://')) {
            urls.push(target);
        } else {
            urls.push(`http://${target}`);
            urls.push(`https://${target}`);
        }
        return urls;
    }

    async checkSiteHealth(url) {
        try {
            const response = await axios.get(url, { timeout: 10000 });
            
            if (response.status >= 200 && response.status < 400) {
                this.findings.push({
                    type: 'site_health',
                    url: url,
                    status: 'up',
                    status_code: response.status,
                    response_time: response.headers['x-response-time'] || 'N/A',
                    severity: 'info',
                    description: `Site is healthy (HTTP ${response.status})`,
                    timestamp: new Date().toISOString()
                });
            } else {
                this.findings.push({
                    type: 'site_health',
                    url: url,
                    status: 'down',
                    status_code: response.status,
                    severity: 'high',
                    description: `Site returned HTTP ${response.status}`,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            this.findings.push({
                type: 'site_health',
                url: url,
                status: 'down',
                severity: 'critical',
                description: `Site is unreachable: ${error.message}`,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testSQLInjection(url) {
        const payloads = this.payloads.sql_injection;
        
        for (const payload of payloads) {
            try {
                const testUrl = `${url}?id=${encodeURIComponent(payload)}`;
                const response = await axios.get(testUrl, { timeout: 5000 });
                
                // Check for SQL error messages
                const errorPatterns = [
                    'sql syntax',
                    'mysql_fetch',
                    'ORA-',
                    'SQLite',
                    'PostgreSQL',
                    'Microsoft OLE DB'
                ];
                
                for (const pattern of errorPatterns) {
                    if (response.data.toLowerCase().includes(pattern.toLowerCase())) {
                        this.findings.push({
                            type: 'sql_injection',
                            url: url,
                            payload: payload,
                            severity: 'critical',
                            description: `SQL Injection vulnerability detected with payload: ${payload}`,
                            proof: `Response contained "${pattern}"`,
                            remediation: 'Use parameterized queries or ORM',
                            timestamp: new Date().toISOString()
                        });
                        return; // Stop testing more payloads
                    }
                }
            } catch (error) {
                // Silent fail for individual payloads
            }
        }
    }

    async testXSS(url) {
        const payloads = this.payloads.xss;
        
        for (const payload of payloads) {
            try {
                const testUrl = `${url}?q=${encodeURIComponent(payload)}`;
                const response = await axios.get(testUrl, { timeout: 5000 });
                
                if (response.data.includes(payload)) {
                    this.findings.push({
                        type: 'xss',
                        url: url,
                        payload: payload,
                        severity: 'high',
                        description: `XSS vulnerability detected with payload: ${payload}`,
                        proof: 'Payload was reflected in response',
                        remediation: 'Escape/validate user input, use Content Security Policy',
                        timestamp: new Date().toISOString()
                    });
                    return; // Stop testing more payloads
                }
            } catch (error) {
                // Silent fail for individual payloads
            }
        }
    }

    async testPathTraversal(url) {
        const payloads = this.payloads.path_traversal;
        
        for (const payload of payloads) {
            try {
                const testUrl = `${url}/file/${encodeURIComponent(payload)}`;
                const response = await axios.get(testUrl, { timeout: 5000 });
                
                // Check for sensitive file contents
                const sensitivePatterns = [
                    'root:x:',
                    'Administrator',
                    'mysql',
                    'postgres',
                    '[extensions]'
                ];
                
                for (const pattern of sensitivePatterns) {
                    if (response.data.includes(pattern)) {
                        this.findings.push({
                            type: 'path_traversal',
                            url: url,
                            payload: payload,
                            severity: 'critical',
                            description: `Path Traversal vulnerability detected with payload: ${payload}`,
                            proof: `Response contained "${pattern}"`,
                            remediation: 'Validate file paths, use whitelist',
                            timestamp: new Date().toISOString()
                        });
                        return;
                    }
                }
            } catch (error) {
                // Silent fail for individual payloads
            }
        }
    }

    async checkSSL(url) {
        if (!url.startsWith('https://')) return;

        try {
            const https = require('https');
            const parsedUrl = new URL(url);
            
            const agent = new https.Agent({
                rejectUnauthorized: false // Don't reject to check cert
            });

            const response = await axios.get(url, {
                httpsAgent: agent,
                timeout: 10000
            });

            const cert = response.request.socket.getPeerCertificate();
            
            if (cert.valid_from) {
                const expiryDate = new Date(cert.valid_to);
                const daysLeft = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                
                if (daysLeft < 7) {
                    this.findings.push({
                        type: 'ssl_expiry',
                        url: url,
                        days_left: daysLeft,
                        severity: daysLeft < 3 ? 'critical' : 'high',
                        description: `SSL certificate expires in ${daysLeft} days`,
                        remediation: `Renew SSL certificate before ${cert.valid_to}`,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        } catch (error) {
            // Silent fail
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

const webScanner = new WebScanner();
module.exports = { webScanner };
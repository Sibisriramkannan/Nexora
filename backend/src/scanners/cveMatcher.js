const axios = require('axios');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class CVEMatcher {
    constructor() {
        this.cveCache = new Map();
        this.lastUpdate = null;
        this.updateInterval = 86400000; // 24 hours
        this.cveDb = [];
        this.isUpdating = false;
    }

    // Initialize and load CVE database
    async initialize() {
        try {
            await this.loadCVEDatabase();
            setInterval(() => {
                this.loadCVEDatabase();
            }, this.updateInterval);
            logger.info('✅ CVE Matcher initialized');
        } catch (error) {
            logger.error('❌ Failed to initialize CVE Matcher:', error);
        }
    }

    // Load CVE database
    async loadCVEDatabase() {
        if (this.isUpdating) {
            return;
        }

        this.isUpdating = true;
        try {
            // Load from NVD API
            const response = await axios.get(
                'https://services.nvd.nist.gov/rest/json/cves/2.0',
                {
                    params: {
                        resultsPerPage: 1000,
                        startIndex: 0
                    },
                    timeout: 30000
                }
            );

            if (response.data && response.data.vulnerabilities) {
                this.cveDb = response.data.vulnerabilities.map(v => ({
                    id: v.cve.id,
                    description: v.cve.descriptions?.find(d => d.lang === 'en')?.value || '',
                    cvss_score: this.getCVSSScore(v.cve),
                    cvss_severity: this.getCVSSSeverity(v.cve),
                    published_date: v.cve.published,
                    last_modified: v.cve.lastModified,
                    affected: this.parseAffected(v.cve),
                    references: v.cve.references?.map(r => r.url) || [],
                    exploit_available: false,
                    remediation: this.generateRemediation(v.cve)
                }));

                this.lastUpdate = new Date();
                logger.info(`✅ Loaded ${this.cveDb.length} CVEs from NVD`);
            }

            // Check for exploits (simplified)
            for (const cve of this.cveDb) {
                cve.exploit_available = await this.checkExploitAvailability(cve.id);
            }

        } catch (error) {
            logger.error('❌ Failed to load CVE database:', error);
            // Use cached data if available
        } finally {
            this.isUpdating = false;
        }
    }

    // Match CVE against service/version
    matchCVE(service, version, product = '') {
        const results = [];
        
        for (const cve of this.cveDb) {
            for (const affected of cve.affected) {
                if (this.isAffected(affected, service, version, product)) {
                    results.push({
                        ...cve,
                        match_score: this.calculateMatchScore(affected, service, version),
                        affected_versions: affected.versions || []
                    });
                }
            }
        }

        // Sort by CVSS score descending
        results.sort((a, b) => b.cvss_score - a.cvss_score);
        return results;
    }

    // Match CVE against package
    matchCVEByPackage(packageName, packageVersion) {
        const results = [];
        
        for (const cve of this.cveDb) {
            for (const affected of cve.affected) {
                if (affected.package && this.isPackageAffected(affected.package, packageName, packageVersion)) {
                    results.push({
                        ...cve,
                        match_score: this.calculatePackageMatchScore(affected.package, packageName)
                    });
                }
            }
        }

        results.sort((a, b) => b.cvss_score - a.cvss_score);
        return results;
    }

    // Check if service is affected
    isAffected(affected, service, version, product) {
        // Check vendor/product match
        if (affected.vendor && affected.product) {
            if (!this.matchesPattern(service, affected.product) &&
                !this.matchesPattern(product, affected.product)) {
                return false;
            }
        }

        // Check version
        if (affected.versions && affected.versions.length > 0) {
            return this.isVersionAffected(version, affected.versions);
        }

        return true;
    }

    // Check if version is affected
    isVersionAffected(version, versionRanges) {
        for (const range of versionRanges) {
            if (this.isVersionInRange(version, range)) {
                return true;
            }
        }
        return false;
    }

    // Check if version is in range
    isVersionInRange(version, range) {
        if (range.version) {
            return version === range.version;
        }

        if (range.lessThan && version < range.lessThan) {
            return true;
        }

        if (range.greaterThan && version > range.greaterThan) {
            return true;
        }

        return false;
    }

    // Check if package is affected
    isPackageAffected(pkg, packageName, packageVersion) {
        if (!this.matchesPattern(packageName, pkg.name)) {
            return false;
        }

        if (pkg.versions && pkg.versions.length > 0) {
            return this.isVersionAffected(packageVersion, pkg.versions);
        }

        return true;
    }

    // Match pattern
    matchesPattern(value, pattern) {
        if (!value || !pattern) return false;
        
        // Simple wildcard matching
        if (pattern.includes('*')) {
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$', 'i');
            return regex.test(value);
        }
        
        return value.toLowerCase().includes(pattern.toLowerCase()) ||
               pattern.toLowerCase().includes(value.toLowerCase());
    }

    // Calculate match score
    calculateMatchScore(affected, service) {
        let score = 0;
        if (affected.product && this.matchesPattern(service, affected.product)) {
            score += 0.5;
        }
        if (affected.vendor && this.matchesPattern(service, affected.vendor)) {
            score += 0.5;
        }
        return Math.min(score, 1);
    }

    calculatePackageMatchScore(pkg, packageName) {
        return this.matchesPattern(packageName, pkg.name) ? 1 : 0;
    }

    // Get CVSS score
    getCVSSScore(cve) {
        const metrics = cve.metrics;
        if (metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore) {
            return metrics.cvssMetricV31[0].cvssData.baseScore;
        }
        if (metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore) {
            return metrics.cvssMetricV30[0].cvssData.baseScore;
        }
        if (metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore) {
            return metrics.cvssMetricV2[0].cvssData.baseScore;
        }
        return 0;
    }

    // Get CVSS severity
    getCVSSSeverity(cve) {
        const score = this.getCVSSScore(cve);
        if (score >= 9.0) return 'critical';
        if (score >= 7.0) return 'high';
        if (score >= 4.0) return 'medium';
        return 'low';
    }

    // Parse affected
    parseAffected(cve) {
        const affected = [];
        if (cve.affects?.vendor?.vendor_data) {
            for (const vendor of cve.affects.vendor.vendor_data) {
                for (const product of vendor.product.product_data) {
                    for (const version of product.version.version_data) {
                        affected.push({
                            vendor: vendor.vendor_name,
                            product: product.product_name,
                            versions: [{
                                version: version.version_value
                            }]
                        });
                    }
                }
            }
        }
        return affected;
    }

    // Generate remediation
    generateRemediation(cve) {
        const recommendations = [];
        
        // Check if there's a patch version
        for (const affected of this.parseAffected(cve)) {
            if (affected.versions && affected.versions.length > 0) {
                const version = affected.versions[0]?.version;
                if (version) {
                    recommendations.push(`Upgrade to version above ${version}`);
                }
            }
        }

        // Add generic recommendations
        if (this.getCVSSScore(cve) >= 9.0) {
            recommendations.push('Apply patch immediately');
            recommendations.push('Consider temporary mitigation if patch unavailable');
        } else if (this.getCVSSScore(cve) >= 7.0) {
            recommendations.push('Apply patch as soon as possible');
        } else {
            recommendations.push('Apply patch during regular maintenance');
        }

        return recommendations.join('; ');
    }

    // Check exploit availability
    async checkExploitAvailability(cveId) {
        try {
            // Check Exploit-DB
            const response = await axios.get(
                'https://www.exploit-db.com/search',
                {
                    params: {
                        cve: cveId
                    },
                    timeout: 5000
                }
            );
            return response.data && response.data.length > 0;
        } catch (error) {
            // If API fails, return false
            return false;
        }
    }

    // Get CVE by ID
    getCVEById(cveId) {
        return this.cveDb.find(c => c.id === cveId);
    }

    // Search CVE by keyword
    searchCVE(keyword) {
        const results = [];
        const searchTerm = keyword.toLowerCase();

        for (const cve of this.cveDb) {
            if (cve.id.toLowerCase().includes(searchTerm) ||
                cve.description.toLowerCase().includes(searchTerm)) {
                results.push(cve);
            }
        }

        return results;
    }

    // Get latest CVEs
    getLatestCVEs(limit = 50) {
        return this.cveDb
            .sort((a, b) => new Date(b.published_date) - new Date(a.published_date))
            .slice(0, limit);
    }

    // Get CVEs by severity
    getCVEsBySeverity(severity) {
        return this.cveDb.filter(c => c.cvss_severity === severity);
    }

    // Get statistics
    getStatistics() {
        const stats = {
            total: this.cveDb.length,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            with_exploit: 0,
            last_updated: this.lastUpdate
        };

        for (const cve of this.cveDb) {
            if (stats[cve.cvss_severity] !== undefined) {
                stats[cve.cvss_severity]++;
            }
            if (cve.exploit_available) {
                stats.with_exploit++;
            }
        }

        return stats;
    }
}

// Export singleton
const cveMatcher = new CVEMatcher();
module.exports = cveMatcher;
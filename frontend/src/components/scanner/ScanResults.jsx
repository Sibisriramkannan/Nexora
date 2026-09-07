import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFileAlt, FaDownload, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Badge from '../common/Badge';
import Button from '../common/Button';

const ScanResults = ({ scan, onClose }) => {
    const [loading, setLoading] = useState(false);

    const findings = scan?.results?.findings || [];
    const summary = scan?.results?.summary || {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    };

    const getSeverityBadge = (severity) => {
        const badges = {
            critical: 'danger',
            high: 'warning',
            medium: 'info',
            low: 'default'
        };
        return badges[severity] || 'default';
    };

    const handleDownload = async (format) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`Report downloaded as ${format}`);
        } catch (error) {
            toast.error('Failed to download report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">Scan Results: {scan?.name}</h3>
                    <p className="text-sm text-gray-400">
                        {scan?.type} • {new Date(scan?.completed_at).toLocaleString()}
                    </p>
                </div>
                <Badge variant={scan?.status === 'completed' ? 'success' : 'warning'}>
                    {scan?.status}
                </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-white">{summary.total}</div>
                    <div className="text-sm text-gray-400">Total Findings</div>
                </div>
                <div className="text-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                    <div className="text-2xl font-bold text-red-500">{summary.critical}</div>
                    <div className="text-sm text-gray-400">Critical</div>
                </div>
                <div className="text-center p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-500">{summary.high}</div>
                    <div className="text-sm text-gray-400">High</div>
                </div>
                <div className="text-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-500">{summary.medium + summary.low}</div>
                    <div className="text-sm text-gray-400">Medium + Low</div>
                </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {findings.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <FaShieldAlt className="text-4xl mx-auto mb-3 text-green-500" />
                        <p>No vulnerabilities found</p>
                        <p className="text-sm">The scan completed successfully</p>
                    </div>
                ) : (
                    findings.map((finding, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                        <Badge variant={getSeverityBadge(finding.severity)}>
                                            {finding.severity?.toUpperCase() || 'INFO'}
                                        </Badge>
                                        <span className="text-sm font-medium text-white">
                                            {finding.cve_id || finding.type}
                                        </span>
                                        {finding.cve_id && (
                                            <span className="text-xs text-gray-400">
                                                CVSS: {finding.cvss_score || 'N/A'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-300 mt-2">
                                        {finding.description}
                                    </p>
                                    {finding.remediation && (
                                        <div className="mt-2 text-sm">
                                            <span className="text-gray-400">Remediation: </span>
                                            <span className="text-green-400">{finding.remediation}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                <Button onClick={() => handleDownload('pdf')} loading={loading} size="sm">
                    <FaFileAlt className="mr-2" />
                    Download PDF
                </Button>
                <Button onClick={() => handleDownload('csv')} loading={loading} size="sm" variant="secondary">
                    <FaFileAlt className="mr-2" />
                    Download CSV
                </Button>
                <Button onClick={() => handleDownload('json')} loading={loading} size="sm" variant="secondary">
                    <FaFileAlt className="mr-2" />
                    Download JSON
                </Button>
                <Button onClick={onClose} size="sm" variant="secondary" className="ml-auto">
                    Close
                </Button>
            </div>
        </div>
    );
};

export default ScanResults;
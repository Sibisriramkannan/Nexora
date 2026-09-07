import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaFileAlt, FaDownload } from 'react-icons/fa';
import { useQuery } from 'react-query';
import api from '../utils/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';

const ScanDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: scanData, isLoading, error } = useQuery(
        ['scan', id],
        async () => {
            const response = await api.get(`/api/scanner/${id}`);
            return response.data.data;
        }
    );

    if (isLoading) {
        return <Loading fullScreen />;
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500">
                <p>Error loading scan details</p>
                <Button onClick={() => navigate('/scanner')} variant="secondary" className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    const scan = scanData;

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'default',
            running: 'info',
            completed: 'success',
            failed: 'danger',
            cancelled: 'warning'
        };
        return badges[status] || 'default';
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

    const findings = scan.results?.findings || [];
    const summary = scan.results?.summary || {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6"
        >
            {/* Navigation */}
            <div className="flex items-center space-x-4 mb-6">
                <button
                    onClick={() => navigate('/scanner')}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <FaArrowLeft className="text-gray-400" />
                </button>
                <h1 className="text-2xl font-bold text-white">
                    Scan: {scan.name}
                </h1>
                <Badge variant={getStatusBadge(scan.status)}>
                    {scan.status.toUpperCase()}
                </Badge>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="text-center">
                    <div className="text-sm text-gray-400">Total Findings</div>
                    <div className="text-2xl font-bold text-white">{summary.total}</div>
                </Card>
                <Card className="text-center border-red-500/20">
                    <div className="text-sm text-gray-400">Critical</div>
                    <div className="text-2xl font-bold text-red-500">{summary.critical}</div>
                </Card>
                <Card className="text-center border-orange-500/20">
                    <div className="text-sm text-gray-400">High</div>
                    <div className="text-2xl font-bold text-orange-500">{summary.high}</div>
                </Card>
                <Card className="text-center border-yellow-500/20">
                    <div className="text-sm text-gray-400">Medium + Low</div>
                    <div className="text-2xl font-bold text-yellow-500">{summary.medium + summary.low}</div>
                </Card>
            </div>

            {/* Scan Details */}
            <Card className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Scan Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                            <span className="text-gray-400">Type</span>
                            <span className="text-white capitalize">{scan.type}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                            <span className="text-gray-400">Targets</span>
                            <span className="text-white">{scan.targets?.join(', ') || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                            <span className="text-gray-400">Started At</span>
                            <span className="text-white">
                                {scan.started_at ? new Date(scan.started_at).toLocaleString() : 'N/A'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                            <span className="text-gray-400">Completed At</span>
                            <span className="text-white">
                                {scan.completed_at ? new Date(scan.completed_at).toLocaleString() : 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                            <span className="text-gray-400">Duration</span>
                            <span className="text-white">
                                {scan.started_at && scan.completed_at
                                    ? `${Math.floor((new Date(scan.completed_at) - new Date(scan.started_at)) / 1000)}s`
                                    : 'N/A'}
                            </span>
                        </div>
                        {scan.error && (
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-gray-400">Error</span>
                                <span className="text-red-400">{scan.error}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Findings */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Findings</h3>
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary">
                            <FaFileAlt className="mr-1" />
                            Export PDF
                        </Button>
                        <Button size="sm" variant="secondary">
                            <FaDownload className="mr-1" />
                            Download CSV
                        </Button>
                    </div>
                </div>

                {findings.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No findings in this scan</p>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {findings.map((finding, index) => (
                            <div key={index} className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <Badge variant={getSeverityBadge(finding.severity)}>
                                                {finding.severity?.toUpperCase() || 'INFO'}
                                            </Badge>
                                            <span className="text-sm font-medium text-white">
                                                {finding.cve_id || finding.type}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300 mt-1">
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
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </motion.div>
    );
};

export default ScanDetails;
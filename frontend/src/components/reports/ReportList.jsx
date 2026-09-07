import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFileAlt, FaDownload, FaTrash, FaEye, FaCalendar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const ReportList = () => {
    const [reports, setReports] = useState([
        {
            id: 1,
            name: 'Uptime Report - January 2024',
            type: 'uptime',
            format: 'PDF',
            generated: '2024-01-31 10:30:00',
            size: '2.4 MB',
            status: 'ready'
        },
        {
            id: 2,
            name: 'Security Report - Q1 2024',
            type: 'security',
            format: 'PDF',
            generated: '2024-01-30 14:20:00',
            size: '5.1 MB',
            status: 'ready'
        },
        {
            id: 3,
            name: 'Compliance Report - January 2024',
            type: 'compliance',
            format: 'Excel',
            generated: '2024-01-29 09:15:00',
            size: '1.8 MB',
            status: 'generating'
        }
    ]);

    const getTypeIcon = (type) => {
        const icons = {
            uptime: '📈',
            security: '🛡️',
            compliance: '📋',
            performance: '⚡',
            sla: '📊'
        };
        return icons[type] || '📄';
    };

    const handleDownload = (id) => {
        toast.success('Report download started');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            setReports(reports.filter(r => r.id !== id));
            toast.success('Report deleted');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-white">Generated Reports</h3>
                    <p className="text-sm text-gray-400">List of all generated reports</p>
                </div>
                <Button variant="secondary">
                    <FaCalendar className="mr-2" />
                    Schedule Report
                </Button>
            </div>

            <div className="space-y-3">
                {reports.map((report) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="text-2xl">{getTypeIcon(report.type)}</div>
                            <div>
                                <h4 className="text-white font-medium">{report.name}</h4>
                                <div className="flex items-center space-x-3 text-sm text-gray-400">
                                    <span>{report.format}</span>
                                    <span>•</span>
                                    <span>{report.size}</span>
                                    <span>•</span>
                                    <span>{new Date(report.generated).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Badge variant={report.status === 'ready' ? 'success' : 'warning'}>
                                {report.status}
                            </Badge>
                            {report.status === 'ready' && (
                                <>
                                    <button
                                        onClick={() => handleDownload(report.id)}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                        title="Download Report"
                                    >
                                        <FaDownload className="text-green-400" />
                                    </button>
                                    <button
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                        title="View Report"
                                    >
                                        <FaEye className="text-blue-400" />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => handleDelete(report.id)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                title="Delete Report"
                            >
                                <FaTrash className="text-red-400" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {reports.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <FaFileAlt className="text-4xl mx-auto mb-3 opacity-50" />
                    <p>No reports generated yet</p>
                </div>
            )}
        </div>
    );
};

export default ReportList;
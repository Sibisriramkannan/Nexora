import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FaFileAlt, FaDownload, FaCalendar, FaClock,
    FaFilePdf, FaFileExcel, FaFileCsv, FaFileImage,
    FaEnvelope, FaShare, FaEye
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Reports = () => {
    const [selectedReport, setSelectedReport] = useState(null);
    const [generating, setGenerating] = useState(false);

    const reportTypes = [
        {
            id: 'uptime',
            name: 'Uptime Report',
            description: 'Server and service uptime statistics',
            icon: <FaClock className="text-blue-400" />,
            formats: ['PDF', 'Excel', 'CSV']
        },
        {
            id: 'security',
            name: 'Security Report',
            description: 'Vulnerability and security findings',
            icon: <FaFileAlt className="text-red-400" />,
            formats: ['PDF', 'CSV', 'HTML']
        },
        {
            id: 'compliance',
            name: 'Compliance Report',
            description: 'Compliance status (PCI-DSS, HIPAA, GDPR)',
            icon: <FaFileAlt className="text-green-400" />,
            formats: ['PDF', 'Excel', 'JSON']
        },
        {
            id: 'performance',
            name: 'Performance Report',
            description: 'Response time and performance metrics',
            icon: <FaFileAlt className="text-yellow-400" />,
            formats: ['PDF', 'Excel', 'CSV']
        },
        {
            id: 'sla',
            name: 'SLA Report',
            description: 'Service Level Agreement compliance',
            icon: <FaFileAlt className="text-purple-400" />,
            formats: ['PDF', 'Excel']
        },
        {
            id: 'custom',
            name: 'Custom Report',
            description: 'Build your own custom report',
            icon: <FaFileAlt className="text-gray-400" />,
            formats: ['PDF', 'Excel', 'CSV', 'JSON', 'HTML']
        }
    ];

    const handleGenerate = (reportId) => {
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            toast.success(`✅ Report generated successfully`);
        }, 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Reports
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Generate and download reports
                    </p>
                </div>
            </div>

            {/* Report Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {reportTypes.map((report) => (
                    <motion.div
                        key={report.id}
                        whileHover={{ scale: 1.02 }}
                        className="glass-card p-6 cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                    >
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                                {report.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white">
                                    {report.name}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    {report.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {report.formats.map((format) => (
                                        <span key={format} className="text-xs px-2 py-1 bg-white/5 rounded-lg text-gray-400">
                                            {format}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    📊 Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => handleGenerate('uptime')}
                        className="flex items-center justify-center space-x-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <FaFilePdf className="text-red-400" />
                        <span className="text-sm text-gray-300">Generate PDF</span>
                    </button>
                    <button
                        onClick={() => handleGenerate('security')}
                        className="flex items-center justify-center space-x-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <FaFileExcel className="text-green-400" />
                        <span className="text-sm text-gray-300">Export Excel</span>
                    </button>
                    <button
                        onClick={() => handleGenerate('performance')}
                        className="flex items-center justify-center space-x-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <FaFileCsv className="text-blue-400" />
                        <span className="text-sm text-gray-300">Export CSV</span>
                    </button>
                    <button
                        className="flex items-center justify-center space-x-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <FaEnvelope className="text-purple-400" />
                        <span className="text-sm text-gray-300">Schedule Email</span>
                    </button>
                </div>
            </div>

            {/* Report Generation Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-6 max-w-2xl w-full"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Generate {selectedReport.name}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {selectedReport.description}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <FaFileAlt className="text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Format
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedReport.formats.map((format) => (
                                        <button
                                            key={format}
                                            className="px-4 py-2 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-colors"
                                        >
                                            {format}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Time Period
                                </label>
                                <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]">
                                    <option value="last24h">Last 24 Hours</option>
                                    <option value="last7d">Last 7 Days</option>
                                    <option value="last30d">Last 30 Days</option>
                                    <option value="last90d">Last 90 Days</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Include
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded border-white/10 bg-white/5 text-[#6C63FF]" />
                                        <span className="text-sm text-gray-300">Server Details</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded border-white/10 bg-white/5 text-[#6C63FF]" />
                                        <span className="text-sm text-gray-300">Metrics</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded border-white/10 bg-white/5 text-[#6C63FF]" />
                                        <span className="text-sm text-gray-300">Alerts</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded border-white/10 bg-white/5 text-[#6C63FF]" />
                                        <span className="text-sm text-gray-300">Charts</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4 border-t border-white/10">
                                <button
                                    onClick={() => {
                                        handleGenerate(selectedReport.id);
                                        setSelectedReport(null);
                                    }}
                                    disabled={generating}
                                    className="flex-1 py-2 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {generating ? 'Generating...' : 'Generate Report'}
                                </button>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default Reports;
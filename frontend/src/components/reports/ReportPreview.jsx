import React from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaPrint, FaShare, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Card from '../common/Card';
import Button from '../common/Button';

const ReportPreview = ({ report, onClose }) => {
    if (!report) {
        return (
            <div className="text-center py-12 text-gray-400">
                No report to preview
            </div>
        );
    }

    const handleDownload = () => {
        toast.success('Downloading report...');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        toast.success('Share link copied to clipboard');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-4xl mx-auto"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white">{report.name}</h3>
                    <p className="text-sm text-gray-400">
                        Generated: {new Date(report.generated).toLocaleString()}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={handleDownload}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Download"
                    >
                        <FaDownload className="text-green-400" />
                    </button>
                    <button
                        onClick={handlePrint}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Print"
                    >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Share"
                    >
                        <FaShare className="text-blue-400" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Close"
                    >
                        <FaTimes className="text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 min-h-[400px]">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Nexora</h1>
                    <p className="text-gray-400">SECURE · MONITOR · PROTECT</p>
                </div>

                <div className="space-y-4">
                    <div className="border-b border-white/10 pb-4">
                        <h4 className="text-lg font-semibold text-white">Executive Summary</h4>
                        <p className="text-gray-300 mt-2">
                            This report provides a comprehensive overview of your infrastructure
                            health, security posture, and compliance status.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                            <div className="text-2xl font-bold text-green-400">99.8%</div>
                            <div className="text-sm text-gray-400">Uptime</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-400">12</div>
                            <div className="text-sm text-gray-400">Critical Alerts</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                            <div className="text-2xl font-bold text-red-400">34</div>
                            <div className="text-sm text-gray-400">Vulnerabilities</div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <h4 className="text-lg font-semibold text-white">Detailed Findings</h4>
                        <div className="mt-2 space-y-2">
                            <div className="flex justify-between p-2 bg-white/5 rounded-lg">
                                <span className="text-gray-300">Total Servers Monitored</span>
                                <span className="text-white font-medium">45</span>
                            </div>
                            <div className="flex justify-between p-2 bg-white/5 rounded-lg">
                                <span className="text-gray-300">Average Response Time</span>
                                <span className="text-white font-medium">120ms</span>
                            </div>
                            <div className="flex justify-between p-2 bg-white/5 rounded-lg">
                                <span className="text-gray-300">Security Score</span>
                                <span className="text-yellow-400 font-medium">72/100</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                <span>Nexora v1.0.0</span>
                <span>Confidential - Internal Use Only</span>
            </div>
        </motion.div>
    );
};

export default ReportPreview;
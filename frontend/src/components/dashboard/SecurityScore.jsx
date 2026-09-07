import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const SecurityScore = ({ score = 72, details = {} }) => {
    const [showDetails, setShowDetails] = useState(false);

    const getScoreColor = () => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const getScoreLabel = () => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    };

    const getScoreIcon = () => {
        if (score >= 80) return <FaCheckCircle className="text-green-500 text-2xl" />;
        if (score >= 60) return <FaShieldAlt className="text-yellow-500 text-2xl" />;
        return <FaExclamationTriangle className="text-red-500 text-2xl" />;
    };

    const getScoreEmoji = () => {
        if (score >= 80) return '🛡️';
        if (score >= 60) return '🔒';
        if (score >= 40) return '⚠️';
        return '🚨';
    };

    const items = [
        { label: 'Critical', value: details.critical || 0, color: 'text-red-500' },
        { label: 'High', value: details.high || 0, color: 'text-orange-500' },
        { label: 'Medium', value: details.medium || 0, color: 'text-yellow-500' },
        { label: 'Low', value: details.low || 0, color: 'text-blue-500' }
    ];

    const totalVulns = items.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <svg className="w-24 h-24">
                            <circle
                                className="text-gray-700"
                                strokeWidth="6"
                                stroke="currentColor"
                                fill="transparent"
                                r="40"
                                cx="48"
                                cy="48"
                            />
                            <circle
                                className={getScoreColor()}
                                strokeWidth="6"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="40"
                                cx="48"
                                cy="48"
                                strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                                strokeDashoffset="0"
                                transform="rotate(-90 48 48)"
                                style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-2xl font-bold ${getScoreColor()}`}>
                                {score}
                            </span>
                            <span className="text-xs text-gray-400">/100</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getScoreEmoji()}</span>
                            <span className={`text-xl font-bold ${getScoreColor()}`}>
                                {getScoreLabel()}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400">Security Posture</p>
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-xs text-[#6C63FF] hover:text-[#00D4FF] transition-colors mt-1"
                        >
                            {showDetails ? 'Hide Details' : 'View Details'}
                        </button>
                    </div>
                </div>

                {getScoreIcon()}
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>Security Score</span>
                    <span>{score}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${getScoreColor()} bg-gradient-to-r from-[#6C63FF] to-[#00D4FF]`}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {items.map((item) => (
                    <div key={item.label} className="text-center p-2 bg-white/5 rounded-lg">
                        <div className={`text-lg font-bold ${item.color}`}>
                            {item.value}
                        </div>
                        <div className="text-xs text-gray-400">{item.label}</div>
                    </div>
                ))}
            </div>

            {showDetails && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-3 border-t border-white/10"
                >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between p-2 bg-white/5 rounded-lg">
                            <span className="text-gray-400">Patched</span>
                            <span className="text-green-400">{details.patched || 0}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-white/5 rounded-lg">
                            <span className="text-gray-400">In Progress</span>
                            <span className="text-yellow-400">{details.in_progress || 0}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-white/5 rounded-lg">
                            <span className="text-gray-400">Pending</span>
                            <span className="text-red-400">{details.pending || 0}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-white/5 rounded-lg">
                            <span className="text-gray-400">Total Vulns</span>
                            <span className="text-white">{totalVulns}</span>
                        </div>
                    </div>

                    <div className="text-center text-xs text-gray-500">
                        Last scan: 2 hours ago • {totalVulns} vulnerabilities detected
                    </div>
                </motion.div>
            )}

            <button className="w-full py-2 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-xl text-white font-medium hover:opacity-90 transition-opacity text-sm">
                Run Full Security Scan
            </button>
        </div>
    );
};

export default SecurityScore;
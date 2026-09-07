import React from 'react';
import { motion } from 'framer-motion';
import { 
    FaCircle, FaCheckCircle, FaClock, FaExclamationTriangle,
    FaInfoCircle, FaBell
} from 'react-icons/fa';

const AlertList = ({ alerts = [], maxDisplay = 5 }) => {
    const getSeverityColor = (severity) => {
        const colors = {
            critical: 'text-red-500',
            high: 'text-orange-500',
            warning: 'text-yellow-500',
            info: 'text-blue-500'
        };
        return colors[severity] || 'text-gray-500';
    };

    const getSeverityBadge = (severity) => {
        const badges = {
            critical: 'bg-red-500/20 text-red-500',
            high: 'bg-orange-500/20 text-orange-500',
            warning: 'bg-yellow-500/20 text-yellow-500',
            info: 'bg-blue-500/20 text-blue-500'
        };
        return badges[severity] || 'bg-gray-500/20 text-gray-500';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'triggered':
                return <FaCircle className="text-red-500 animate-pulse" />;
            case 'acknowledged':
                return <FaClock className="text-yellow-500" />;
            case 'resolved':
                return <FaCheckCircle className="text-green-500" />;
            default:
                return <FaCircle className="text-gray-500" />;
        }
    };

    const displayAlerts = alerts.slice(0, maxDisplay);
    const hasMore = alerts.length > maxDisplay;

    return (
        <div className="space-y-3">
            {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <FaCheckCircle className="text-4xl mx-auto mb-3 text-green-500" />
                    <p className="font-medium">All Systems Healthy</p>
                    <p className="text-sm">No active alerts</p>
                </div>
            ) : (
                <>
                    {displayAlerts.map((alert, index) => (
                        <motion.div
                            key={alert.id || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-start space-x-3">
                                <div className="mt-0.5">
                                    {getStatusIcon(alert.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSeverityBadge(alert.severity)}`}>
                                            {alert.severity.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-400 truncate">
                                            {alert.source || 'Unknown'}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
                                            {alert.time || 'Just now'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white truncate mt-0.5">
                                        {alert.message}
                                    </p>
                                    {alert.server_name && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Server: {alert.server_name}
                                        </p>
                                    )}
                                </div>
                                <button className="text-xs text-[#6C63FF] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    View
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    
                    {hasMore && (
                        <button className="w-full text-center text-sm text-[#6C63FF] hover:text-[#00D4FF] transition-colors py-2">
                            + {alerts.length - maxDisplay} more alerts
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default AlertList;
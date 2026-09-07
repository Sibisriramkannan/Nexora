import React from 'react';
import { motion } from 'framer-motion';
import { FaCpu, FaMemory, FaHdd, FaClock } from 'react-icons/fa';
import Card from '../common/Card';

const ServerStats = ({ server }) => {
    if (!server) {
        return (
            <div className="text-center py-8 text-gray-400">
                No server data available
            </div>
        );
    }

    const stats = [
        {
            label: 'CPU Usage',
            value: server.cpu_usage || 0,
            icon: <FaCpu className="text-blue-400" />,
            color: 'blue'
        },
        {
            label: 'Memory Usage',
            value: server.memory_usage || 0,
            icon: <FaMemory className="text-green-400" />,
            color: 'green'
        },
        {
            label: 'Disk Usage',
            value: server.disk_usage || 0,
            icon: <FaHdd className="text-yellow-400" />,
            color: 'yellow'
        },
        {
            label: 'Uptime',
            value: server.uptime ? `${Math.floor(server.uptime / 86400)}d` : 'N/A',
            icon: <FaClock className="text-purple-400" />,
            color: 'purple',
            isPercent: false
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="text-xl">{stat.icon}</div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-400">{stat.label}</p>
                            <p className="text-xl font-bold text-white">
                                {stat.isPercent !== false ? `${stat.value}%` : stat.value}
                            </p>
                        </div>
                    </div>
                    {stat.isPercent !== false && (
                        <div className="mt-2 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(stat.value, 100)}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className={`h-full bg-${stat.color}-500 rounded-full`}
                            />
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
};

export default ServerStats;
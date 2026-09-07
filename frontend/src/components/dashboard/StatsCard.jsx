import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ icon, title, value, subValue, change, color }) => {
    const colorMap = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        red: 'from-red-500 to-red-600',
        yellow: 'from-yellow-500 to-yellow-600',
        purple: 'from-purple-500 to-purple-600'
    };

    const bgColor = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
            className="glass-card p-6 relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgColor} opacity-10 rounded-full -translate-y-16 translate-x-16`} />
            
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {value}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {subValue}
                        </span>
                        {change !== undefined && (
                            <span className={`text-sm font-medium ${
                                change >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                            </span>
                        )}
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${bgColor} flex items-center justify-center text-white text-xl shadow-lg`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
};

export default StatsCard;
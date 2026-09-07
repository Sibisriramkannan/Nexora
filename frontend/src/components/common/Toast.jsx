import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ type = 'info', message, onClose, duration = 5000 }) => {
    const types = {
        success: {
            icon: <FaCheckCircle className="text-green-400" />,
            bg: 'bg-green-500/20',
            border: 'border-green-500/30'
        },
        error: {
            icon: <FaTimesCircle className="text-red-400" />,
            bg: 'bg-red-500/20',
            border: 'border-red-500/30'
        },
        warning: {
            icon: <FaExclamationCircle className="text-yellow-400" />,
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/30'
        },
        info: {
            icon: <FaInfoCircle className="text-blue-400" />,
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/30'
        }
    };

    const toastType = types[type] || types.info;

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center space-x-3 p-4 rounded-xl ${toastType.bg} border ${toastType.border} backdrop-blur-sm min-w-[300px] max-w-md`}
            >
                <div className="flex-shrink-0 text-xl">
                    {toastType.icon}
                </div>
                <div className="flex-1 text-sm text-white">
                    {message}
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <FaTimes className="text-gray-400" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

export default Toast;
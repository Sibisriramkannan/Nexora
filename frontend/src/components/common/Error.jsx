import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';
import Button from './Button';

const Error = ({ message, retry, className = '' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-6 text-center ${className}`}
        >
            <div className="flex flex-col items-center space-y-3">
                <FaExclamationTriangle className="text-red-500 text-4xl" />
                <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
                <p className="text-gray-400 text-sm">{message || 'An error occurred'}</p>
                {retry && (
                    <Button onClick={retry} variant="secondary">
                        Try Again
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

export default Error;
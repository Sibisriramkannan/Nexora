import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaEdit, FaTrash, FaPlay, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const MonitorDetails = ({ monitor, onDelete, onTest }) => {
    const navigate = useNavigate();

    if (!monitor) {
        return (
            <div className="text-center py-12 text-gray-400">
                Monitor not found
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const badges = {
            up: 'success',
            down: 'danger',
            warning: 'warning',
            unknown: 'default'
        };
        return badges[status] || 'default';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/monitors')}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <FaArrowLeft className="text-gray-400" />
                </button>
                <h2 className="text-2xl font-bold text-white">{monitor.name}</h2>
                <Badge variant={getStatusBadge(monitor.status)}>
                    {monitor.status.toUpperCase()}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Monitor Information</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Type</span>
                            <span className="text-white">{monitor.type.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Target</span>
                            <span className="text-white">{monitor.target}</span>
                        </div>
                        {monitor.port && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Port</span>
                                <span className="text-white">{monitor.port}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-400">Interval</span>
                            <span className="text-white">{monitor.interval}s</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Timeout</span>
                            <span className="text-white">{monitor.timeout}s</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Retries</span>
                            <span className="text-white">{monitor.retries}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Uptime</span>
                            <span className="text-white">{monitor.uptime_percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Response Time</span>
                            <span className={`${monitor.response_time > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                                {monitor.response_time}ms
                            </span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Thresholds</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Warning</span>
                            <span className="text-yellow-400">{monitor.thresholds?.warning || 2000}ms</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Critical</span>
                            <span className="text-red-400">{monitor.thresholds?.critical || 5000}ms</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                        <div className="flex space-x-3">
                            <Button onClick={() => onTest && onTest(monitor.id)} variant="success">
                                <FaPlay className="mr-2" />
                                Test
                            </Button>
                            <Button variant="secondary">
                                <FaChartLine className="mr-2" />
                                Metrics
                            </Button>
                            <Button variant="secondary">
                                <FaEdit className="mr-2" />
                                Edit
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => onDelete && onDelete(monitor.id)}
                            >
                                <FaTrash className="mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
};

export default MonitorDetails;
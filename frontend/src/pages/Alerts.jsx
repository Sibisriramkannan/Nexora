import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { 
    FaBell, FaCheckCircle, FaClock, FaTimes, FaFilter,
    FaExclamationTriangle, FaInfoCircle, FaEye
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

const Alerts = () => {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [selectedAlert, setSelectedAlert] = useState(null);

    // Fetch alerts
    const { data: alerts, isLoading } = useQuery('alerts', async () => {
        const response = await api.get('/api/alerts');
        return response.data.data;
    });

    // Fetch alert stats
    const { data: stats } = useQuery('alertStats', async () => {
        const response = await api.get('/api/alerts/stats');
        return response.data.data;
    });

    // Acknowledge alert mutation
    const acknowledgeMutation = useMutation(
        (id) => api.post(`/api/alerts/${id}/acknowledge`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('alerts');
                queryClient.invalidateQueries('alertStats');
                toast.success('Alert acknowledged');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to acknowledge alert');
            }
        }
    );

    // Resolve alert mutation
    const resolveMutation = useMutation(
        (id) => api.post(`/api/alerts/${id}/resolve`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('alerts');
                queryClient.invalidateQueries('alertStats');
                toast.success('Alert resolved');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to resolve alert');
            }
        }
    );

    const getSeverityColor = (severity) => {
        const colors = {
            critical: 'text-red-500 bg-red-500/20',
            high: 'text-orange-500 bg-orange-500/20',
            warning: 'text-yellow-500 bg-yellow-500/20',
            info: 'text-blue-500 bg-blue-500/20'
        };
        return colors[severity] || 'text-gray-500 bg-gray-500/20';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'triggered':
                return <FaExclamationTriangle className="text-red-500 animate-pulse" />;
            case 'acknowledged':
                return <FaClock className="text-yellow-500" />;
            case 'resolved':
                return <FaCheckCircle className="text-green-500" />;
            case 'muted':
                return <FaTimes className="text-gray-500" />;
            default:
                return <FaInfoCircle className="text-gray-500" />;
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            triggered: 'danger',
            acknowledged: 'warning',
            resolved: 'success',
            muted: 'default'
        };
        return badges[status] || 'default';
    };

    const filteredAlerts = alerts?.filter(alert => {
        const matchesFilter = filter === 'all' || alert.status === filter;
        const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
        return matchesFilter && matchesSeverity;
    });

    if (isLoading) {
        return <Loading fullScreen />;
    }

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
                        Alerts
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Monitor and manage your alerts
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="text-center">
                    <div className="text-2xl font-bold text-white">{stats?.total || 0}</div>
                    <div className="text-sm text-gray-400">Total Alerts</div>
                </Card>
                <Card className="text-center border-red-500/20">
                    <div className="text-2xl font-bold text-red-500">{stats?.active || 0}</div>
                    <div className="text-sm text-gray-400">Active</div>
                </Card>
                <Card className="text-center border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-500">{stats?.critical || 0}</div>
                    <div className="text-sm text-gray-400">Critical</div>
                </Card>
                <Card className="text-center border-green-500/20">
                    <div className="text-2xl font-bold text-green-500">{stats?.today || 0}</div>
                    <div className="text-sm text-gray-400">Today</div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
                >
                    <option value="all">All Status</option>
                    <option value="triggered">Triggered</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="resolved">Resolved</option>
                    <option value="muted">Muted</option>
                </select>
                <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
                >
                    <option value="all">All Severity</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                </select>
            </div>

            {/* Alert List */}
            {filteredAlerts?.length === 0 ? (
                <div className="text-center py-20">
                    <FaBell className="text-6xl text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl text-gray-400">No alerts found</h3>
                    <p className="text-gray-500 mt-2">All systems are healthy</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredAlerts?.map((alert) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="glass-card p-4 hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => setSelectedAlert(alert)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1">
                                    <div className="mt-1">
                                        {getStatusIcon(alert.status)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSeverityColor(alert.severity)}`}>
                                                {alert.severity.toUpperCase()}
                                            </span>
                                            <Badge variant={getStatusBadge(alert.status)} size="sm">
                                                {alert.status}
                                            </Badge>
                                            <span className="text-xs text-gray-400">
                                                {new Date(alert.triggered_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white mt-1">
                                            {alert.message}
                                        </p>
                                        {alert.details?.server_name && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Server: {alert.details.server_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex space-x-2 ml-4 flex-shrink-0">
                                    {alert.status === 'triggered' && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    acknowledgeMutation.mutate(alert.id);
                                                }}
                                            >
                                                Acknowledge
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="success"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    resolveMutation.mutate(alert.id);
                                                }}
                                            >
                                                Resolve
                                            </Button>
                                        </>
                                    )}
                                    {alert.status === 'acknowledged' && (
                                        <Button
                                            size="sm"
                                            variant="success"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                resolveMutation.mutate(alert.id);
                                            }}
                                        >
                                            Resolve
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAlert(alert);
                                        }}
                                    >
                                        <FaEye />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Alert Detail Modal */}
            {selectedAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Alert Details
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {new Date(selectedAlert.triggered_at).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedAlert(null)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <FaTimes className="text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <span className={`text-sm font-medium px-3 py-1 rounded-full ${getSeverityColor(selectedAlert.severity)}`}>
                                    {selectedAlert.severity.toUpperCase()}
                                </span>
                                <Badge variant={getStatusBadge(selectedAlert.status)}>
                                    {selectedAlert.status}
                                </Badge>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400">Message</label>
                                <p className="text-white">{selectedAlert.message}</p>
                            </div>

                            {selectedAlert.details && (
                                <div>
                                    <label className="text-sm text-gray-400">Details</label>
                                    <pre className="bg-black/30 p-4 rounded-xl text-gray-300 text-sm overflow-x-auto">
                                        {JSON.stringify(selectedAlert.details, null, 2)}
                                    </pre>
                                </div>
                            )}

                            <div className="flex space-x-3 pt-4 border-t border-white/10">
                                {selectedAlert.status === 'triggered' && (
                                    <>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                acknowledgeMutation.mutate(selectedAlert.id);
                                                setSelectedAlert(null);
                                            }}
                                        >
                                            Acknowledge
                                        </Button>
                                        <Button
                                            variant="success"
                                            onClick={() => {
                                                resolveMutation.mutate(selectedAlert.id);
                                                setSelectedAlert(null);
                                            }}
                                        >
                                            Resolve
                                        </Button>
                                    </>
                                )}
                                {selectedAlert.status === 'acknowledged' && (
                                    <Button
                                        variant="success"
                                        onClick={() => {
                                            resolveMutation.mutate(selectedAlert.id);
                                            setSelectedAlert(null);
                                        }}
                                    >
                                        Resolve
                                    </Button>
                                )}
                                <Button
                                    variant="secondary"
                                    onClick={() => setSelectedAlert(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default Alerts;
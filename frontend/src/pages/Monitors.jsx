import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { 
    FaPlus, FaSearch, FaGlobe, FaEdit, FaTrash, FaPlay,
    FaServer, FaDatabase, FaCloud, FaShieldAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import MonitorForm from '../components/monitors/MonitorForm';
import Loading from '../components/common/Loading';

const Monitors = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingMonitor, setEditingMonitor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    // Fetch monitors
    const { data: monitors, isLoading } = useQuery('monitors', async () => {
        const response = await api.get('/api/monitors');
        return response.data.data;
    });

    // Delete monitor mutation
    const deleteMutation = useMutation(
        (id) => api.delete(`/api/monitors/${id}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('monitors');
                toast.success('Monitor deleted successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete monitor');
            }
        }
    );

    // Test monitor mutation
    const testMutation = useMutation(
        (id) => api.post(`/api/monitors/${id}/test`),
        {
            onSuccess: (data) => {
                const result = data.data.data;
                if (result.status === 'up') {
                    toast.success(`✅ Monitor is UP (${result.response_time}ms)`);
                } else {
                    toast.error(`❌ Monitor is DOWN: ${result.message}`);
                }
            },
            onError: (error) => {
                toast.error('Failed to test monitor');
            }
        }
    );

    const getStatusBadge = (status) => {
        const badges = {
            up: 'success',
            down: 'danger',
            warning: 'warning',
            unknown: 'default'
        };
        return badges[status] || 'default';
    };

    const getTypeIcon = (type) => {
        const icons = {
            http: <FaGlobe className="text-blue-400" />,
            https: <FaShieldAlt className="text-green-400" />,
            ping: <FaServer className="text-yellow-400" />,
            tcp: <FaDatabase className="text-purple-400" />,
            dns: <FaCloud className="text-cyan-400" />
        };
        return icons[type] || <FaGlobe className="text-gray-400" />;
    };

    const filteredMonitors = monitors?.filter(monitor => {
        const matchesSearch = monitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              monitor.target.includes(searchTerm);
        const matchesFilter = filter === 'all' || monitor.type === filter;
        return matchesSearch && matchesFilter;
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
                        Monitors
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Monitor your infrastructure and services
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setEditingMonitor(null);
                        setShowModal(true);
                    }}
                >
                    <FaPlus className="mr-2" />
                    Add Monitor
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search monitors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#6C63FF] transition-colors"
                        />
                    </div>
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
                >
                    <option value="all">All Types</option>
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                    <option value="ping">Ping</option>
                    <option value="tcp">TCP</option>
                    <option value="dns">DNS</option>
                </select>
            </div>

            {/* Monitor Grid */}
            {filteredMonitors?.length === 0 ? (
                <div className="text-center py-20">
                    <FaGlobe className="text-6xl text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl text-gray-400">No monitors found</h3>
                    <p className="text-gray-500 mt-2">Add your first monitor to start tracking</p>
                    <Button
                        onClick={() => {
                            setEditingMonitor(null);
                            setShowModal(true);
                        }}
                        className="mt-4"
                    >
                        Add Monitor
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMonitors?.map((monitor) => (
                        <motion.div
                            key={monitor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                                        {getTypeIcon(monitor.type)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white truncate max-w-[150px]">
                                            {monitor.name}
                                        </h3>
                                        <p className="text-xs text-gray-400">{monitor.type.toUpperCase()}</p>
                                    </div>
                                </div>
                                <Badge variant={getStatusBadge(monitor.status)}>
                                    {monitor.status.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Target</span>
                                    <span className="text-white truncate max-w-[150px]">{monitor.target}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Interval</span>
                                    <span className="text-white">{monitor.interval}s</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Response</span>
                                    <span className={`${monitor.response_time > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                                        {monitor.response_time}ms
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Uptime</span>
                                    <span className="text-white">{monitor.uptime_percentage}%</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => testMutation.mutate(monitor.id)}
                                        className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors"
                                        title="Test Monitor"
                                    >
                                        <FaPlay className="text-green-400" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingMonitor(monitor);
                                            setShowModal(true);
                                        }}
                                        className="p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors"
                                        title="Edit Monitor"
                                    >
                                        <FaEdit className="text-yellow-400" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this monitor?')) {
                                            deleteMutation.mutate(monitor.id);
                                        }
                                    }}
                                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                    title="Delete Monitor"
                                >
                                    <FaTrash className="text-red-400" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingMonitor(null);
                }}
                title={editingMonitor ? 'Edit Monitor' : 'Add Monitor'}
            >
                <MonitorForm
                    monitor={editingMonitor}
                    onClose={() => {
                        setShowModal(false);
                        setEditingMonitor(null);
                        queryClient.invalidateQueries('monitors');
                    }}
                />
            </Modal>
        </motion.div>
    );
};

export default Monitors;
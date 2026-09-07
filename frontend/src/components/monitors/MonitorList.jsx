import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaPlay, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import MonitorForm from './MonitorForm';

const MonitorList = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingMonitor, setEditingMonitor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    const { data: monitors, isLoading } = useQuery('monitors', async () => {
        const response = await api.get('/api/monitors');
        return response.data.data;
    });

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

    const filteredMonitors = monitors?.filter(monitor => {
        const matchesSearch = monitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              monitor.target.includes(searchTerm);
        const matchesFilter = filter === 'all' || monitor.type === filter;
        return matchesSearch && matchesFilter;
    });

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
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
                <Button onClick={() => { setEditingMonitor(null); setShowModal(true); }}>
                    <FaPlus className="mr-2" />
                    Add Monitor
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMonitors?.map((monitor) => (
                    <motion.div
                        key={monitor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-4"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="text-white font-medium">{monitor.name}</h4>
                                <p className="text-xs text-gray-400">{monitor.type.toUpperCase()} • {monitor.target}</p>
                            </div>
                            <Badge variant={getStatusBadge(monitor.status)}>
                                {monitor.status.toUpperCase()}
                            </Badge>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-400">Interval</span>
                                <p className="text-white">{monitor.interval}s</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Response</span>
                                <p className={`${monitor.response_time > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                                    {monitor.response_time}ms
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-400">Uptime</span>
                                <p className="text-white">{monitor.uptime_percentage}%</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Status</span>
                                <p className="text-white">{monitor.status}</p>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => testMutation.mutate(monitor.id)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Test Monitor"
                                >
                                    <FaPlay className="text-green-400" />
                                </button>
                                <button
                                    onClick={() => { setEditingMonitor(monitor); setShowModal(true); }}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
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
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                title="Delete Monitor"
                            >
                                <FaTrash className="text-red-400" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredMonitors?.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400">No monitors found</p>
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingMonitor(null); }}
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
        </div>
    );
};

export default MonitorList;
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    FaArrowLeft, FaServer, FaEdit, FaTrash, FaPlay,
    FaCpu, FaMemory, FaHdd, FaNetworkWired,
    FaShieldAlt, FaBell, FaChartLine, FaDatabase
} from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';

const ServerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('overview');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Fetch server details
    const { data: serverData, isLoading, error } = useQuery(
        ['server', id],
        async () => {
            const response = await api.get(`/api/servers/${id}`);
            return response.data.data;
        },
        {
            refetchInterval: 30000
        }
    );

    // Delete server mutation
    const deleteMutation = useMutation(
        () => api.delete(`/api/servers/${id}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('servers');
                toast.success('Server deleted successfully');
                navigate('/servers');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete server');
            }
        }
    );

    if (isLoading) {
        return <Loading fullScreen />;
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">Error loading server details</p>
                <Button onClick={() => navigate('/servers')} variant="secondary" className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    const server = serverData;

    const getStatusBadge = (status) => {
        const badges = {
            online: 'success',
            offline: 'danger',
            warning: 'warning',
            unknown: 'default'
        };
        return badges[status] || 'default';
    };

    const getStatusDot = (status) => {
        const colors = {
            online: 'bg-green-500',
            offline: 'bg-red-500',
            warning: 'bg-yellow-500',
            unknown: 'bg-gray-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FaServer /> },
        { id: 'metrics', label: 'Metrics', icon: <FaChartLine /> },
        { id: 'monitors', label: 'Monitors', icon: <FaNetworkWired /> },
        { id: 'scans', label: 'Scans', icon: <FaShieldAlt /> },
        { id: 'alerts', label: 'Alerts', icon: <FaBell /> }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6"
        >
            {/* Navigation */}
            <div className="flex items-center space-x-4 mb-6">
                <button
                    onClick={() => navigate('/servers')}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <FaArrowLeft className="text-gray-400" />
                </button>
                <h1 className="text-2xl font-bold text-white">
                    {server.name}
                </h1>
                <Badge variant={getStatusBadge(server.status)}>
                    <span className={`inline-block w-2 h-2 rounded-full ${getStatusDot(server.status)} mr-2 animate-pulse`} />
                    {server.status.toUpperCase()}
                </Badge>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <FaCpu className="text-blue-400" />
                        <span className="text-sm text-gray-400">CPU</span>
                    </div>
                    <div className="text-2xl font-bold text-white mt-1">
                        {server.cpu_usage || 0}%
                    </div>
                </Card>
                <Card className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <FaMemory className="text-green-400" />
                        <span className="text-sm text-gray-400">Memory</span>
                    </div>
                    <div className="text-2xl font-bold text-white mt-1">
                        {server.memory_usage || 0}%
                    </div>
                </Card>
                <Card className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <FaHdd className="text-yellow-400" />
                        <span className="text-sm text-gray-400">Disk</span>
                    </div>
                    <div className="text-2xl font-bold text-white mt-1">
                        {server.disk_usage || 0}%
                    </div>
                </Card>
                <Card className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <FaServer className="text-purple-400" />
                        <span className="text-sm text-gray-400">Uptime</span>
                    </div>
                    <div className="text-2xl font-bold text-white mt-1">
                        {server.uptime ? `${Math.floor(server.uptime / 86400)}d` : 'N/A'}
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                            activeTab === tab.id
                                ? 'bg-gradient-to-r from-[#6C63FF]/20 to-[#00D4FF]/20 text-white border border-[#6C63FF]/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Server Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Name</span>
                                <span className="text-white">{server.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Hostname</span>
                                <span className="text-white">{server.hostname || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">IP Address</span>
                                <span className="text-white">{server.ip_address}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">OS</span>
                                <span className="text-white">{server.os}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Environment</span>
                                <span className="text-white capitalize">{server.environment}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Group</span>
                                <span className="text-white">{server.group}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Tags</span>
                                <div className="flex flex-wrap gap-1">
                                    {server.tags?.map((tag, i) => (
                                        <Badge key={i} size="sm">{tag}</Badge>
                                    ))}
                                    {(!server.tags || server.tags.length === 0) && (
                                        <span className="text-gray-500">No tags</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Agent Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Agent Installed</span>
                                <Badge variant={server.agent_installed ? 'success' : 'default'}>
                                    {server.agent_installed ? '✅ Yes' : '❌ No'}
                                </Badge>
                            </div>
                            {server.agent_installed && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Agent Version</span>
                                        <span className="text-white">{server.agent_version || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Last Seen</span>
                                        <span className="text-white">
                                            {server.last_seen ? new Date(server.last_seen).toLocaleString() : 'Never'}
                                        </span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-400">Monitor Enabled</span>
                                <Badge variant={server.monitor_enabled ? 'success' : 'default'}>
                                    {server.monitor_enabled ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Scan Enabled</span>
                                <Badge variant={server.scan_enabled ? 'success' : 'default'}>
                                    {server.scan_enabled ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            {server.description && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <span className="text-gray-400">Description</span>
                                    <p className="text-white text-sm mt-1">{server.description}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'metrics' && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Performance Metrics
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">CPU Usage</span>
                                <span className="text-white">{server.cpu_usage || 0}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(server.cpu_usage || 0, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Memory Usage</span>
                                <span className="text-white">{server.memory_usage || 0}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(server.memory_usage || 0, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Disk Usage</span>
                                <span className="text-white">{server.disk_usage || 0}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-yellow-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(server.disk_usage || 0, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {activeTab === 'monitors' && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Associated Monitors
                    </h3>
                    {server.monitors && server.monitors.length > 0 ? (
                        <div className="space-y-3">
                            {server.monitors.map((monitor) => (
                                <div key={monitor.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                    <div>
                                        <p className="text-white font-medium">{monitor.name}</p>
                                        <p className="text-sm text-gray-400">
                                            {monitor.type.toUpperCase()} • {monitor.target}
                                        </p>
                                    </div>
                                    <Badge variant={monitor.status === 'up' ? 'success' : 'danger'}>
                                        {monitor.status.toUpperCase()}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-8">No monitors associated</p>
                    )}
                </Card>
            )}

            {activeTab === 'scans' && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Scan History
                    </h3>
                    <p className="text-gray-400 text-center py-8">No scan history available</p>
                </Card>
            )}

            {activeTab === 'alerts' && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Alert History
                    </h3>
                    <p className="text-gray-400 text-center py-8">No alerts for this server</p>
                </Card>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="secondary">
                    <FaEdit className="mr-2" />
                    Edit Server
                </Button>
                <Button variant="success">
                    <FaPlay className="mr-2" />
                    Start Scan
                </Button>
                <Button 
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                >
                    <FaTrash className="mr-2" />
                    Delete Server
                </Button>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Server"
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        Are you sure you want to delete the server <strong className="text-white">{server.name}</strong>?
                        This action cannot be undone and will remove all associated monitors and data.
                    </p>
                    <div className="flex space-x-3 pt-4 border-t border-white/10">
                        <Button
                            variant="danger"
                            onClick={() => {
                                deleteMutation.mutate();
                                setShowDeleteModal(false);
                            }}
                            loading={deleteMutation.isLoading}
                            className="flex-1"
                        >
                            Yes, Delete Server
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
};

export default ServerDetails;
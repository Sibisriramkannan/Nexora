import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { 
    FaPlus, FaSearch, FaServer, FaEdit, FaTrash, FaEye,
    FaDownload, FaUpload
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Loading from '../components/common/Loading';

const Servers = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingServer, setEditingServer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        ip_address: '',
        port: 22,
        os: 'Linux',
        environment: 'development',
        group: 'Default',
        tags: [],
        description: '',
        monitor_enabled: true,
        scan_enabled: true
    });

    const { data: servers, isLoading } = useQuery('servers', async () => {
        const response = await api.get('/api/servers');
        return response.data.data;
    });

    const deleteMutation = useMutation(
        (id) => api.delete(`/api/servers/${id}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('servers');
                toast.success('Server deleted successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete server');
            }
        }
    );

    const saveMutation = useMutation(
        (data) => {
            if (editingServer) {
                return api.put(`/api/servers/${editingServer.id}`, data);
            }
            return api.post('/api/servers', data);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('servers');
                toast.success(editingServer ? 'Server updated successfully' : 'Server created successfully');
                setShowModal(false);
                setEditingServer(null);
                resetForm();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to save server');
            }
        }
    );

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

    const resetForm = () => {
        setFormData({
            name: '',
            ip_address: '',
            port: 22,
            os: 'Linux',
            environment: 'development',
            group: 'Default',
            tags: [],
            description: '',
            monitor_enabled: true,
            scan_enabled: true
        });
    };

    const handleEdit = (server) => {
        setEditingServer(server);
        setFormData({
            name: server.name || '',
            ip_address: server.ip_address || '',
            port: server.port || 22,
            os: server.os || 'Linux',
            environment: server.environment || 'development',
            group: server.group || 'Default',
            tags: server.tags || [],
            description: server.description || '',
            monitor_enabled: server.monitor_enabled !== undefined ? server.monitor_enabled : true,
            scan_enabled: server.scan_enabled !== undefined ? server.scan_enabled : true
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    const filteredServers = servers?.filter(server => {
        const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              server.ip_address.includes(searchTerm);
        const matchesFilter = filter === 'all' || server.status === filter;
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
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Servers
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage your infrastructure servers
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" size="sm" onClick={() => toast.info('Import coming soon')}>
                        <FaUpload className="mr-2" />
                        Import
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => toast.info('Export coming soon')}>
                        <FaDownload className="mr-2" />
                        Export
                    </Button>
                    <Button onClick={() => { setEditingServer(null); resetForm(); setShowModal(true); }}>
                        <FaPlus className="mr-2" />
                        Add Server
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search servers..."
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
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="warning">Warning</option>
                    <option value="unknown">Unknown</option>
                </select>
            </div>

            {filteredServers?.length === 0 ? (
                <div className="text-center py-20">
                    <FaServer className="text-6xl text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl text-gray-400">No servers found</h3>
                    <p className="text-gray-500 mt-2">Add your first server to start monitoring</p>
                    <Button onClick={() => { setEditingServer(null); resetForm(); setShowModal(true); }} className="mt-4">
                        Add Server
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServers?.map((server) => (
                        <motion.div
                            key={server.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                            className="glass-card p-6 cursor-pointer"
                            onClick={() => navigate(`/servers/${server.id}`)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot(server.status)} animate-pulse`} />
                                    <h3 className="text-lg font-semibold text-white truncate max-w-[150px]">
                                        {server.name}
                                    </h3>
                                </div>
                                <Badge variant={getStatusBadge(server.status)}>
                                    {server.status.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="space-y-2 text-sm">
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
                                    <span className="text-gray-400">Agent</span>
                                    <span className={server.agent_installed ? 'text-green-400' : 'text-gray-500'}>
                                        {server.agent_installed ? '✅ Installed' : '❌ Not installed'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/servers/${server.id}`); }}
                                        className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                                        title="View Details"
                                    >
                                        <FaEye className="text-blue-400" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(server); }}
                                        className="p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors"
                                        title="Edit Server"
                                    >
                                        <FaEdit className="text-yellow-400" />
                                    </button>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to delete this server?')) {
                                            deleteMutation.mutate(server.id);
                                        }
                                    }}
                                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                    title="Delete Server"
                                >
                                    <FaTrash className="text-red-400" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingServer(null); resetForm(); }}
                title={editingServer ? 'Edit Server' : 'Add Server'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Server Name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., prod-web-01"
                        required
                    />
                    <Input
                        label="IP Address"
                        name="ip_address"
                        value={formData.ip_address}
                        onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                        placeholder="192.168.1.10"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Port"
                            name="port"
                            type="number"
                            value={formData.port}
                            onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                            min="1"
                            max="65535"
                        />
                        <Select
                            label="OS"
                            name="os"
                            value={formData.os}
                            onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                            options={[
                                { value: 'Linux', label: 'Linux' },
                                { value: 'Windows', label: 'Windows' },
                                { value: 'macOS', label: 'macOS' },
                                { value: 'Unknown', label: 'Unknown' }
                            ]}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Environment"
                            name="environment"
                            value={formData.environment}
                            onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                            options={[
                                { value: 'production', label: 'Production' },
                                { value: 'staging', label: 'Staging' },
                                { value: 'development', label: 'Development' }
                            ]}
                        />
                        <Input
                            label="Group"
                            name="group"
                            value={formData.group}
                            onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                            placeholder="Default"
                        />
                    </div>
                    <Input
                        label="Tags (comma separated)"
                        name="tags"
                        value={formData.tags.join(', ')}
                        onChange={(e) => setFormData({ 
                            ...formData, 
                            tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                        })}
                        placeholder="web, api, production"
                    />
                    <Input
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Optional description"
                    />
                    <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.monitor_enabled}
                                onChange={(e) => setFormData({ ...formData, monitor_enabled: e.target.checked })}
                                className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                            />
                            <span className="text-sm text-gray-300">Enable Monitoring</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.scan_enabled}
                                onChange={(e) => setFormData({ ...formData, scan_enabled: e.target.checked })}
                                className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                            />
                            <span className="text-sm text-gray-300">Enable Scanning</span>
                        </label>
                    </div>
                    <div className="flex space-x-3 pt-4 border-t border-white/10">
                        <Button type="submit" loading={saveMutation.isLoading} className="flex-1">
                            {editingServer ? 'Update Server' : 'Create Server'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => { setShowModal(false); setEditingServer(null); resetForm(); }}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
};

export default Servers;
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaServer } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Loading from '../common/Loading';

const ServerList = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

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

    const filteredServers = servers?.filter(server => {
        const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              server.ip_address.includes(searchTerm);
        const matchesFilter = filter === 'all' || server.status === filter;
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServers?.map((server) => (
                    <motion.div
                        key={server.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-4 cursor-pointer"
                        onClick={() => navigate(`/servers/${server.id}`)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot(server.status)} animate-pulse`} />
                                <h4 className="text-white font-medium truncate max-w-[150px]">{server.name}</h4>
                            </div>
                            <Badge variant={getStatusBadge(server.status)}>
                                {server.status.toUpperCase()}
                            </Badge>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-400">IP</span>
                                <p className="text-white">{server.ip_address}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">OS</span>
                                <p className="text-white">{server.os}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Environment</span>
                                <p className="text-white capitalize">{server.environment}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Agent</span>
                                <span className={server.agent_installed ? 'text-green-400' : 'text-gray-500'}>
                                    {server.agent_installed ? '✅' : '❌'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
                            <div className="flex space-x-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/servers/${server.id}`); }}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="View Details"
                                >
                                    <FaEye className="text-blue-400" />
                                </button>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Are you sure you want to delete this server?')) {
                                        deleteMutation.mutate(server.id);
                                    }
                                }}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                title="Delete Server"
                            >
                                <FaTrash className="text-red-400" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredServers?.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <FaServer className="text-4xl mx-auto mb-3 opacity-50" />
                    <p>No servers found</p>
                </div>
            )}
        </div>
    );
};

export default ServerList;
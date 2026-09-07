import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaEdit, FaTrash, FaPlay, FaShieldAlt, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ServerStats from './ServerStats';

const ServerDetails = ({ server, onDelete, onScan }) => {
    const navigate = useNavigate();

    if (!server) {
        return (
            <div className="text-center py-12 text-gray-400">
                Server not found
            </div>
        );
    }

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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/servers')}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <FaArrowLeft className="text-gray-400" />
                </button>
                <h2 className="text-2xl font-bold text-white">{server.name}</h2>
                <Badge variant={getStatusBadge(server.status)}>
                    <span className={`inline-block w-2 h-2 rounded-full ${getStatusDot(server.status)} mr-2 animate-pulse`} />
                    {server.status.toUpperCase()}
                </Badge>
            </div>

            <ServerStats server={server} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Server Information</h3>
                    <div className="space-y-3">
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
                        {server.description && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <span className="text-gray-400">Description</span>
                                <p className="text-white text-sm mt-1">{server.description}</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Agent Status</h3>
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
                    </div>
                </Card>
            </div>

            <div className="flex flex-wrap gap-3">
                <Button variant="secondary">
                    <FaEdit className="mr-2" />
                    Edit Server
                </Button>
                <Button variant="success" onClick={() => onScan && onScan(server.id)}>
                    <FaShieldAlt className="mr-2" />
                    Start Scan
                </Button>
                <Button variant="danger" onClick={() => onDelete && onDelete(server.id)}>
                    <FaTrash className="mr-2" />
                    Delete Server
                </Button>
            </div>
        </motion.div>
    );
};

export default ServerDetails;
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { 
    FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff,
    FaEnvelope, FaSlack, FaTelegram, FaPagerduty, FaJira,
    FaDiscord, FaLink, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Modal from '../components/common/Modal';

const Integrations = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingIntegration, setEditingIntegration] = useState(null);

    // Fetch integrations
    const { data: integrations, isLoading } = useQuery('integrations', async () => {
        const response = await api.get('/api/integrations');
        return response.data.data;
    });

    // Toggle integration mutation
    const toggleMutation = useMutation(
        ({ id, enabled }) => api.put(`/api/integrations/${id}`, { enabled }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('integrations');
                toast.success('Integration updated');
            }
        }
    );

    // Delete integration mutation
    const deleteMutation = useMutation(
        (id) => api.delete(`/api/integrations/${id}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('integrations');
                toast.success('Integration deleted');
            }
        }
    );

    const getIntegrationIcon = (type) => {
        const icons = {
            email: <FaEnvelope className="text-blue-400" />,
            slack: <FaSlack className="text-purple-400" />,
            telegram: <FaTelegram className="text-cyan-400" />,
            pagerduty: <FaPagerduty className="text-red-400" />,
            jira: <FaJira className="text-blue-500" />,
            discord: <FaDiscord className="text-indigo-400" />,
            webhook: <FaLink className="text-green-400" />
        };
        return icons[type] || <FaLink className="text-gray-400" />;
    };

    const getStatusBadge = (enabled, testStatus) => {
        if (enabled && testStatus === 'success') {
            return <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/20 text-green-500">Active</span>;
        } else if (enabled && testStatus === 'failed') {
            return <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-500/20 text-red-500">Error</span>;
        } else if (enabled) {
            return <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">Pending</span>;
        }
        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">Disabled</span>;
    };

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
                        Integrations
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Connect Nexora with your favorite tools
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingIntegration(null);
                        setShowModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                >
                    <FaPlus />
                    <span>Add Integration</span>
                </button>
            </div>

            {/* Integration Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations?.map((integration) => (
                        <motion.div
                            key={integration.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`glass-card p-6 ${integration.enabled ? 'border-[#6C63FF]/30' : 'border-white/10'}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                                        {getIntegrationIcon(integration.type)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            {integration.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 capitalize">{integration.type}</p>
                                    </div>
                                </div>
                                {getStatusBadge(integration.enabled, integration.test_status)}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Events</span>
                                    <span className="text-white">
                                        {integration.events?.join(', ') || 'All'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Last Test</span>
                                    <span className="text-white">
                                        {integration.last_test ? new Date(integration.last_test).toLocaleString() : 'Never'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditingIntegration(integration);
                                            setShowModal(true);
                                        }}
                                        className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                                        title="Edit Integration"
                                    >
                                        <FaEdit className="text-blue-400" />
                                    </button>
                                    <button
                                        onClick={() => toggleMutation.mutate({ 
                                            id: integration.id, 
                                            enabled: !integration.enabled 
                                        })}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                        title={integration.enabled ? 'Disable' : 'Enable'}
                                    >
                                        {integration.enabled ? 
                                            <FaToggleOn className="text-green-400 text-xl" /> :
                                            <FaToggleOff className="text-gray-400 text-xl" />
                                        }
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this integration?')) {
                                            deleteMutation.mutate(integration.id);
                                        }
                                    }}
                                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                    title="Delete Integration"
                                >
                                    <FaTrash className="text-red-400" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {integrations?.length === 0 && !isLoading && (
                <div className="text-center py-20">
                    <FaLink className="text-6xl text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl text-gray-400">No integrations configured</h3>
                    <p className="text-gray-500 mt-2">Connect Nexora with your favorite tools</p>
                    <button
                        onClick={() => {
                            setEditingIntegration(null);
                            setShowModal(true);
                        }}
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        Add Integration
                    </button>
                </div>
            )}

            {/* Integration Form Modal */}
            <Modal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)}
                title={editingIntegration ? 'Edit Integration' : 'Add Integration'}
            >
                {/* Integration Form - Will be implemented */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            placeholder="My Integration"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Type
                        </label>
                        <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]">
                            <option value="slack">Slack</option>
                            <option value="email">Email</option>
                            <option value="telegram">Telegram</option>
                            <option value="pagerduty">PagerDuty</option>
                            <option value="jira">Jira</option>
                            <option value="discord">Discord</option>
                            <option value="webhook">Webhook</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Configuration (JSON)
                        </label>
                        <textarea
                            rows={4}
                            placeholder='{"webhook_url": "https://..."}'
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF] font-mono text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Events
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['critical', 'high', 'warning', 'info'].map((event) => (
                                <label key={event} className="flex items-center space-x-2">
                                    <input type="checkbox" className="rounded border-white/10 bg-white/5 text-[#6C63FF]" />
                                    <span className="text-sm text-gray-300 capitalize">{event}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <button className="w-full py-2 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-xl text-white font-medium hover:opacity-90 transition-opacity">
                        {editingIntegration ? 'Update' : 'Create'} Integration
                    </button>
                </div>
            </Modal>
        </motion.div>
    );
};

export default Integrations;
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTest } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import IntegrationForm from './IntegrationForm';

const IntegrationList = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingIntegration, setEditingIntegration] = useState(null);

    const { data: integrations, isLoading } = useQuery('integrations', async () => {
        const response = await api.get('/api/integrations');
        return response.data.data;
    });

    const toggleMutation = useMutation(
        ({ id, enabled }) => api.put(`/api/integrations/${id}`, { enabled }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('integrations');
                toast.success('Integration updated');
            }
        }
    );

    const deleteMutation = useMutation(
        (id) => api.delete(`/api/integrations/${id}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('integrations');
                toast.success('Integration deleted');
            }
        }
    );

    const testMutation = useMutation(
        (id) => api.post(`/api/integrations/${id}/test`),
        {
            onSuccess: (data) => {
                toast.success(data.data.message || 'Test successful');
                queryClient.invalidateQueries('integrations');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Test failed');
            }
        }
    );

    const getIntegrationIcon = (type) => {
        const icons = {
            email: '📧',
            slack: '💬',
            telegram: '📱',
            pagerduty: '📟',
            jira: '📋',
            discord: '🔔',
            webhook: '🔗'
        };
        return icons[type] || '🔗';
    };

    const getStatusBadge = (enabled, testStatus) => {
        if (enabled && testStatus === 'success') {
            return <Badge variant="success">Active</Badge>;
        } else if (enabled && testStatus === 'failed') {
            return <Badge variant="danger">Error</Badge>;
        } else if (enabled) {
            return <Badge variant="warning">Pending</Badge>;
        }
        return <Badge variant="default">Disabled</Badge>;
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-white">Integrations</h3>
                    <p className="text-sm text-gray-400">Connect Nexora with your favorite tools</p>
                </div>
                <Button onClick={() => { setEditingIntegration(null); setShowModal(true); }}>
                    <FaPlus className="mr-2" />
                    Add Integration
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations?.map((integration) => (
                    <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`glass-card p-4 ${integration.enabled ? 'border-[#6C63FF]/30' : 'border-white/10'}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                                    {getIntegrationIcon(integration.type)}
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">{integration.name}</h4>
                                    <p className="text-xs text-gray-400 capitalize">{integration.type}</p>
                                </div>
                            </div>
                            {getStatusBadge(integration.enabled, integration.test_status)}
                        </div>

                        <div className="mt-3 flex justify-between items-center">
                            <div className="text-sm text-gray-400">
                                Events: {integration.events?.join(', ') || 'All'}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => testMutation.mutate(integration.id)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Test Integration"
                                >
                                    <FaTest className="text-blue-400" />
                                </button>
                                <button
                                    onClick={() => toggleMutation.mutate({ id: integration.id, enabled: !integration.enabled })}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title={integration.enabled ? 'Disable' : 'Enable'}
                                >
                                    {integration.enabled ? 
                                        <FaToggleOn className="text-green-400 text-xl" /> :
                                        <FaToggleOff className="text-gray-400 text-xl" />
                                    }
                                </button>
                                <button
                                    onClick={() => { setEditingIntegration(integration); setShowModal(true); }}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Edit Integration"
                                >
                                    <FaEdit className="text-yellow-400" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this integration?')) {
                                            deleteMutation.mutate(integration.id);
                                        }
                                    }}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Delete Integration"
                                >
                                    <FaTrash className="text-red-400" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {integrations?.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400">No integrations configured</p>
                    <Button onClick={() => { setEditingIntegration(null); setShowModal(true); }} className="mt-2">
                        Add Integration
                    </Button>
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingIntegration(null); }}
                title={editingIntegration ? 'Edit Integration' : 'Add Integration'}
            >
                <IntegrationForm
                    integration={editingIntegration}
                    onClose={() => {
                        setShowModal(false);
                        setEditingIntegration(null);
                        queryClient.invalidateQueries('integrations');
                    }}
                />
            </Modal>
        </div>
    );
};

export default IntegrationList;
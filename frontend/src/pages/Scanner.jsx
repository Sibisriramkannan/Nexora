import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FaPlus, FaSearch, FaShieldAlt, FaPlay, FaStop, FaFileAlt, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Modal from '../components/common/Modal';
import ScanForm from '../components/scanner/ScanForm';
import ScanResults from '../components/scanner/ScanResults';

const Scanner = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [selectedScan, setSelectedScan] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch scans
    const { data: scans, isLoading } = useQuery('scans', async () => {
        const response = await api.get('/api/scanner');
        return response.data.data;
    });

    // Start scan mutation
    const startMutation = useMutation(
        (id) => api.post(`/api/scanner/${id}/start`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('scans');
                toast.success('Scan started successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to start scan');
            }
        }
    );

    // Delete scan mutation
    const deleteMutation = useMutation(
        (id) => api.delete(`/api/scanner/${id}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('scans');
                toast.success('Scan deleted successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete scan');
            }
        }
    );

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-gray-500/20 text-gray-400',
            running: 'bg-blue-500/20 text-blue-500',
            completed: 'bg-green-500/20 text-green-500',
            failed: 'bg-red-500/20 text-red-500',
            cancelled: 'bg-yellow-500/20 text-yellow-500'
        };
        return badges[status] || badges.pending;
    };

    const getStatusIcon = (status) => {
        if (status === 'running') {
            return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
        }
        return null;
    };

    const filteredScans = scans?.filter(scan =>
        scan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.type.includes(searchTerm.toLowerCase())
    );

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
                        Vulnerability Scanner
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Scan your infrastructure for vulnerabilities
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                >
                    <FaPlus />
                    <span>New Scan</span>
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search scans..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#6C63FF] transition-colors"
                    />
                </div>
            </div>

            {/* Scan List */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredScans?.map((scan) => (
                        <motion.div
                            key={scan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1">
                                    <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center">
                                        <FaShieldAlt className="text-[#6C63FF] text-xl" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-lg font-semibold text-white">
                                                {scan.name}
                                            </h3>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(scan.status)}`}>
                                                {scan.status.toUpperCase()}
                                            </span>
                                            {getStatusIcon(scan.status)}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                                            <div>
                                                <span className="text-gray-400">Type</span>
                                                <p className="text-white capitalize">{scan.type}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Targets</span>
                                                <p className="text-white">{scan.targets?.length || 0}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Findings</span>
                                                <p className="text-white">{scan.results?.findings?.length || 0}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Duration</span>
                                                <p className="text-white">
                                                    {scan.started_at && scan.completed_at
                                                        ? `${Math.floor((new Date(scan.completed_at) - new Date(scan.started_at)) / 1000)}s`
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {scan.status === 'pending' && (
                                        <button
                                            onClick={() => startMutation.mutate(scan.id)}
                                            className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors"
                                            title="Start Scan"
                                        >
                                            <FaPlay className="text-green-400" />
                                        </button>
                                    )}
                                    {scan.status === 'running' && (
                                        <button
                                            className="p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors"
                                            title="Stop Scan"
                                        >
                                            <FaStop className="text-yellow-400" />
                                        </button>
                                    )}
                                    {scan.status === 'completed' && (
                                        <button
                                            onClick={() => setSelectedScan(scan)}
                                            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                                            title="View Results"
                                        >
                                            <FaFileAlt className="text-blue-400" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this scan?')) {
                                                deleteMutation.mutate(scan.id);
                                            }
                                        }}
                                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                        title="Delete Scan"
                                    >
                                        <FaTrash className="text-red-400" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {filteredScans?.length === 0 && !isLoading && (
                <div className="text-center py-20">
                    <FaShieldAlt className="text-6xl text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl text-gray-400">No scans found</h3>
                    <p className="text-gray-500 mt-2">Create your first vulnerability scan</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        New Scan
                    </button>
                </div>
            )}

            {/* Modals */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <ScanForm onClose={() => setShowModal(false)} />
            </Modal>

            <Modal isOpen={!!selectedScan} onClose={() => setSelectedScan(null)}>
                <ScanResults scan={selectedScan} onClose={() => setSelectedScan(null)} />
            </Modal>
        </motion.div>
    );
};

export default Scanner;
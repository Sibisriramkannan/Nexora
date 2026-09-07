import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FaPlus, FaPlay, FaStop, FaTrash, FaFileAlt, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import ScanForm from './ScanForm';
import ScanResults from './ScanResults';

const ScanList = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [selectedScan, setSelectedScan] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: scans, isLoading } = useQuery('scans', async () => {
        const response = await api.get('/api/scanner');
        return response.data.data;
    });

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
            pending: 'default',
            running: 'info',
            completed: 'success',
            failed: 'danger',
            cancelled: 'warning'
        };
        return badges[status] || 'default';
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
                            placeholder="Search scans..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#6C63FF] transition-colors"
                        />
                    </div>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <FaPlus className="mr-2" />
                    New Scan
                </Button>
            </div>

            <div className="space-y-3">
                {filteredScans?.map((scan) => (
                    <motion.div
                        key={scan.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                    <h4 className="text-white font-medium">{scan.name}</h4>
                                    <Badge variant={getStatusBadge(scan.status)}>
                                        {scan.status.toUpperCase()}
                                    </Badge>
                                    {getStatusIcon(scan.status)}
                                </div>
                                <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
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
                            <div className="flex space-x-2">
                                {scan.status === 'pending' && (
                                    <button
                                        onClick={() => startMutation.mutate(scan.id)}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                        title="Start Scan"
                                    >
                                        <FaPlay className="text-green-400" />
                                    </button>
                                )}
                                {scan.status === 'running' && (
                                    <button
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                        title="Stop Scan"
                                    >
                                        <FaStop className="text-yellow-400" />
                                    </button>
                                )}
                                {scan.status === 'completed' && (
                                    <button
                                        onClick={() => setSelectedScan(scan)}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
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
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Delete Scan"
                                >
                                    <FaTrash className="text-red-400" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredScans?.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <p>No scans found</p>
                    <Button onClick={() => setShowModal(true)} className="mt-2">
                        Create Scan
                    </Button>
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="New Scan"
            >
                <ScanForm onClose={() => {
                    setShowModal(false);
                    queryClient.invalidateQueries('scans');
                }} />
            </Modal>

            <Modal
                isOpen={!!selectedScan}
                onClose={() => setSelectedScan(null)}
                title="Scan Results"
                size="xl"
            >
                <ScanResults
                    scan={selectedScan}
                    onClose={() => setSelectedScan(null)}
                />
            </Modal>
        </div>
    );
};

export default ScanList;
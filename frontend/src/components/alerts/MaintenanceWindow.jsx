import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaClock, FaCalendarAlt } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';

const MaintenanceWindow = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingWindow, setEditingWindow] = useState(null);
    const [windows, setWindows] = useState([
        {
            id: 1,
            name: 'Production Upgrade',
            description: 'Scheduled maintenance for production servers',
            start: '2024-07-20T02:00',
            end: '2024-07-20T04:00',
            servers: ['prod-web-01', 'prod-web-02', 'prod-db-01'],
            status: 'scheduled',
            created_by: 'Admin'
        },
        {
            id: 2,
            name: 'DB Migration',
            description: 'Database migration and optimization',
            start: '2024-07-22T03:00',
            end: '2024-07-22T05:00',
            servers: ['prod-db-01', 'prod-db-02'],
            status: 'scheduled',
            created_by: 'Admin'
        }
    ]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start: '',
        end: '',
        servers: [],
        status: 'scheduled'
    });

    const serverOptions = [
        { value: 'prod-web-01', label: 'prod-web-01' },
        { value: 'prod-web-02', label: 'prod-web-02' },
        { value: 'prod-db-01', label: 'prod-db-01' },
        { value: 'prod-db-02', label: 'prod-db-02' },
        { value: 'staging-api', label: 'staging-api' }
    ];

    const statusOptions = [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingWindow) {
            setWindows(windows.map(w => w.id === editingWindow.id ? { ...formData, id: w.id } : w));
        } else {
            setWindows([...windows, { ...formData, id: Date.now(), created_by: 'Admin' }]);
        }
        setShowModal(false);
        setEditingWindow(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            start: '',
            end: '',
            servers: [],
            status: 'scheduled'
        });
    };

    const handleEdit = (window) => {
        setEditingWindow(window);
        setFormData(window);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this maintenance window?')) {
            setWindows(windows.filter(w => w.id !== id));
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            scheduled: 'info',
            active: 'warning',
            completed: 'success',
            cancelled: 'default'
        };
        return badges[status] || 'default';
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-white">Maintenance Windows</h3>
                    <p className="text-sm text-gray-400">Schedule maintenance to suppress alerts</p>
                </div>
                <Button onClick={() => { setEditingWindow(null); resetForm(); setShowModal(true); }}>
                    <FaPlus className="mr-2" />
                    Schedule Window
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {windows.map((window) => (
                    <motion.div
                        key={window.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                    <FaClock className="text-[#6C63FF]" />
                                    <h4 className="text-white font-medium">{window.name}</h4>
                                    <Badge variant={getStatusBadge(window.status)}>
                                        {window.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{window.description}</p>
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <FaCalendarAlt className="text-gray-400" />
                                        <span className="text-gray-300">
                                            {new Date(window.start).toLocaleString()} - {new Date(window.end).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {window.servers.map((server) => (
                                            <Badge key={server} size="sm" variant="default">
                                                {server}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(window)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Edit Window"
                                >
                                    <FaEdit className="text-yellow-400" />
                                </button>
                                <button
                                    onClick={() => handleDelete(window.id)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Delete Window"
                                >
                                    <FaTrash className="text-red-400" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingWindow(null); resetForm(); }}
                title={editingWindow ? 'Edit Maintenance Window' : 'Schedule Maintenance Window'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Window Name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Production Upgrade"
                        required
                    />

                    <Input
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the maintenance"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Start Time"
                            name="start"
                            type="datetime-local"
                            value={formData.start}
                            onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                            required
                        />
                        <Input
                            label="End Time"
                            name="end"
                            type="datetime-local"
                            value={formData.end}
                            onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Affected Servers
                        </label>
                        <select
                            multiple
                            value={formData.servers}
                            onChange={(e) => {
                                const values = Array.from(e.target.selectedOptions, option => option.value);
                                setFormData({ ...formData, servers: values });
                            }}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF] h-24"
                        >
                            {serverOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple servers</p>
                    </div>

                    <Select
                        label="Status"
                        name="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        options={statusOptions}
                    />

                    <div className="flex space-x-3 pt-4 border-t border-white/10">
                        <Button type="submit" className="flex-1">
                            {editingWindow ? 'Update Window' : 'Schedule Window'}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => { setShowModal(false); setEditingWindow(null); resetForm(); }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MaintenanceWindow;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaCopy, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';

const TemplateManager = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templates, setTemplates] = useState([
        {
            id: 1,
            name: 'Production Web Server',
            description: 'Standard production web server monitoring',
            checks: ['HTTP', 'Ping', 'SSL'],
            interval: 60,
            timeout: 10,
            retries: 3,
            servers: 12,
            created: '2024-01-15'
        },
        {
            id: 2,
            name: 'Database Server',
            description: 'Database server monitoring template',
            checks: ['TCP', 'Ping'],
            interval: 30,
            timeout: 15,
            retries: 5,
            servers: 8,
            created: '2024-01-20'
        }
    ]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        checks: [],
        interval: 60,
        timeout: 10,
        retries: 3
    });

    const checkOptions = ['HTTP', 'HTTPS', 'Ping', 'TCP', 'DNS', 'SSL'];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTemplate) {
            setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...formData, id: t.id } : t));
            toast.success('Template updated successfully');
        } else {
            setTemplates([...templates, { ...formData, id: Date.now(), servers: 0, created: new Date().toISOString().split('T')[0] }]);
            toast.success('Template created successfully');
        }
        setShowModal(false);
        setEditingTemplate(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            checks: [],
            interval: 60,
            timeout: 10,
            retries: 3
        });
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData(template);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            setTemplates(templates.filter(t => t.id !== id));
            toast.success('Template deleted successfully');
        }
    };

    const handleApply = (template) => {
        toast.success(`Template "${template.name}" applied to ${template.servers} servers`);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-white">Templates</h3>
                    <p className="text-sm text-gray-400">Pre-configured monitoring templates</p>
                </div>
                <Button onClick={() => { setEditingTemplate(null); resetForm(); setShowModal(true); }}>
                    <FaPlus className="mr-2" />
                    New Template
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                    <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-4"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="text-white font-medium">{template.name}</h4>
                                <p className="text-sm text-gray-400">{template.description}</p>
                            </div>
                            <Badge variant="info">{template.servers} servers</Badge>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                            {template.checks.map((check) => (
                                <Badge key={check} size="sm" variant="default">{check}</Badge>
                            ))}
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                            <div>
                                <span className="text-gray-400">Interval</span>
                                <p className="text-white">{template.interval}s</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Timeout</span>
                                <p className="text-white">{template.timeout}s</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Retries</span>
                                <p className="text-white">{template.retries}</p>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleApply(template)}
                                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition-colors"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={() => handleEdit(template)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Edit Template"
                                >
                                    <FaEdit className="text-yellow-400" />
                                </button>
                            </div>
                            <button
                                onClick={() => handleDelete(template.id)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                title="Delete Template"
                            >
                                <FaTrash className="text-red-400" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingTemplate(null); resetForm(); }}
                title={editingTemplate ? 'Edit Template' : 'Create Template'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Template Name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Production Web Server"
                        required
                    />

                    <Input
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the template"
                    />

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Checks
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {checkOptions.map((check) => (
                                <label key={check} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.checks.includes(check)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData({ ...formData, checks: [...formData.checks, check] });
                                            } else {
                                                setFormData({ ...formData, checks: formData.checks.filter(c => c !== check) });
                                            }
                                        }}
                                        className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                                    />
                                    <span className="text-sm text-gray-300">{check}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="Interval (seconds)"
                            name="interval"
                            type="number"
                            value={formData.interval}
                            onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                            min="10"
                            max="3600"
                        />
                        <Input
                            label="Timeout (seconds)"
                            name="timeout"
                            type="number"
                            value={formData.timeout}
                            onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                            min="1"
                            max="60"
                        />
                        <Input
                            label="Retries"
                            name="retries"
                            type="number"
                            value={formData.retries}
                            onChange={(e) => setFormData({ ...formData, retries: parseInt(e.target.value) })}
                            min="0"
                            max="10"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-white/10">
                        <Button type="submit" className="flex-1">
                            {editingTemplate ? 'Update Template' : 'Create Template'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => { setShowModal(false); setEditingTemplate(null); resetForm(); }}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TemplateManager;
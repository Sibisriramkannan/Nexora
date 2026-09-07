import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';

const AlertRules = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [rules, setRules] = useState([
        {
            id: 1,
            name: 'Critical HTTP Down',
            severity: 'critical',
            condition: 'http_status != 200',
            occurrences: 3,
            timeWindow: 60,
            actions: ['pagerduty', 'slack', 'email'],
            enabled: true
        },
        {
            id: 2,
            name: 'Warning HTTP Slow',
            severity: 'warning',
            condition: 'http_latency > 2000',
            occurrences: 2,
            timeWindow: 120,
            actions: ['slack', 'email'],
            enabled: true
        },
        {
            id: 3,
            name: 'Critical SSL Expiry',
            severity: 'critical',
            condition: 'ssl_days_left < 3',
            occurrences: 1,
            timeWindow: 0,
            actions: ['slack', 'email'],
            enabled: true
        }
    ]);

    const [formData, setFormData] = useState({
        name: '',
        severity: 'warning',
        condition: '',
        occurrences: 3,
        timeWindow: 60,
        actions: [],
        enabled: true
    });

    const severityOptions = [
        { value: 'critical', label: 'Critical', color: 'danger' },
        { value: 'high', label: 'High', color: 'danger' },
        { value: 'warning', label: 'Warning', color: 'warning' },
        { value: 'info', label: 'Info', color: 'info' }
    ];

    const actionOptions = [
        { value: 'slack', label: 'Slack' },
        { value: 'email', label: 'Email' },
        { value: 'telegram', label: 'Telegram' },
        { value: 'pagerduty', label: 'PagerDuty' },
        { value: 'jira', label: 'Jira' },
        { value: 'sms', label: 'SMS' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingRule) {
            setRules(rules.map(r => r.id === editingRule.id ? { ...formData, id: r.id } : r));
        } else {
            setRules([...rules, { ...formData, id: Date.now() }]);
        }
        setShowModal(false);
        setEditingRule(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            severity: 'warning',
            condition: '',
            occurrences: 3,
            timeWindow: 60,
            actions: [],
            enabled: true
        });
    };

    const handleEdit = (rule) => {
        setEditingRule(rule);
        setFormData(rule);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this rule?')) {
            setRules(rules.filter(r => r.id !== id));
        }
    };

    const toggleRule = (id) => {
        setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-white">Alert Rules</h3>
                    <p className="text-sm text-gray-400">Configure when alerts should be triggered</p>
                </div>
                <Button onClick={() => { setEditingRule(null); resetForm(); setShowModal(true); }}>
                    <FaPlus className="mr-2" />
                    New Rule
                </Button>
            </div>

            <div className="space-y-3">
                {rules.map((rule) => (
                    <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                    <Badge variant={rule.severity === 'critical' ? 'danger' : rule.severity === 'warning' ? 'warning' : 'info'}>
                                        {rule.severity.toUpperCase()}
                                    </Badge>
                                    <h4 className="text-white font-medium">{rule.name}</h4>
                                    <span className="text-xs text-gray-400">
                                        {rule.occurrences} occurrences in {rule.timeWindow}s
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">
                                    Condition: {rule.condition}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {rule.actions.map((action) => (
                                        <Badge key={action} size="sm" variant="default">
                                            {action}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => toggleRule(rule.id)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title={rule.enabled ? 'Disable' : 'Enable'}
                                >
                                    {rule.enabled ? 
                                        <FaToggleOn className="text-green-400 text-xl" /> :
                                        <FaToggleOff className="text-gray-400 text-xl" />
                                    }
                                </button>
                                <button
                                    onClick={() => handleEdit(rule)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Edit Rule"
                                >
                                    <FaEdit className="text-yellow-400" />
                                </button>
                                <button
                                    onClick={() => handleDelete(rule.id)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Delete Rule"
                                >
                                    <FaTrash className="text-red-400" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingRule(null); resetForm(); }}
                title={editingRule ? 'Edit Alert Rule' : 'New Alert Rule'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Rule Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            placeholder="e.g., Critical HTTP Down"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Severity
                        </label>
                        <select
                            value={formData.severity}
                            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                        >
                            {severityOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Condition
                        </label>
                        <input
                            type="text"
                            value={formData.condition}
                            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            placeholder="e.g., http_status != 200"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Supported: http_status, http_latency, ssl_days_left, cpu_usage, memory_usage, disk_usage
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Occurrences
                            </label>
                            <input
                                type="number"
                                value={formData.occurrences}
                                onChange={(e) => setFormData({ ...formData, occurrences: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Time Window (seconds)
                            </label>
                            <input
                                type="number"
                                value={formData.timeWindow}
                                onChange={(e) => setFormData({ ...formData, timeWindow: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Actions
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {actionOptions.map((action) => (
                                <label key={action.value} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.actions.includes(action.value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData({ ...formData, actions: [...formData.actions, action.value] });
                                            } else {
                                                setFormData({ ...formData, actions: formData.actions.filter(a => a !== action.value) });
                                            }
                                        }}
                                        className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                                    />
                                    <span className="text-sm text-gray-300">{action.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-white/10">
                        <Button type="submit" className="flex-1">
                            {editingRule ? 'Update Rule' : 'Create Rule'}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => { setShowModal(false); setEditingRule(null); resetForm(); }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AlertRules;
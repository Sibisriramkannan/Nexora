import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCopy, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';

const AlertTemplates = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templates, setTemplates] = useState([
        {
            id: 1,
            name: 'Critical Alert Email',
            channel: 'email',
            format: 'html',
            subject: '🚨 CRITICAL: {{.ServerName}} is DOWN',
            body: 'Server {{.ServerName}} ({{.ServerIP}}) is down. Time: {{.Timestamp}}',
            variables: ['ServerName', 'ServerIP', 'Status', 'Timestamp', 'Message', 'Action'],
            usage: 245,
            rating: 4.8
        },
        {
            id: 2,
            name: 'Slack Incident Response',
            channel: 'slack',
            format: 'blocks',
            subject: '🚨 {{.Severity}} Alert',
            body: 'Server: {{.ServerName}}\nStatus: {{.Status}}\nTime: {{.Timestamp}}',
            variables: ['Severity', 'ServerName', 'Status', 'Timestamp', 'Message', 'Action'],
            usage: 189,
            rating: 4.7
        },
        {
            id: 3,
            name: 'PagerDuty Critical Alert',
            channel: 'pagerduty',
            format: 'json',
            subject: '{{.Severity}} Alert',
            body: '{"summary": "{{.Message}}", "severity": "{{.Severity}}"}',
            variables: ['Severity', 'Message', 'ServerName', 'Status'],
            usage: 156,
            rating: 4.9
        }
    ]);

    const channelIcons = {
        email: '📧',
        slack: '💬',
        telegram: '📱',
        pagerduty: '📟',
        jira: '📋',
        discord: '🔔',
        webhook: '🔗'
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-white">Alert Templates</h3>
                    <p className="text-sm text-gray-400">Pre-built templates for alert notifications</p>
                </div>
                <Button onClick={() => setShowModal(true)}>
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
                        className="glass-card p-4 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xl">{channelIcons[template.channel] || '📝'}</span>
                                    <h4 className="text-white font-medium">{template.name}</h4>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Badge size="sm" variant="default">{template.channel}</Badge>
                                    <Badge size="sm" variant="default">{template.format}</Badge>
                                    <span className="text-xs text-gray-400">
                                        ⭐ {template.rating} • {template.usage} uses
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-2 truncate">
                                    Subject: {template.subject}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {template.variables.map((v) => (
                                        <Badge key={v} size="sm" variant="purple">
                                            {`{{.${v}}}`}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                                <button
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Use Template"
                                >
                                    <FaCopy className="text-blue-400" />
                                </button>
                                <button
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Edit Template"
                                >
                                    <FaEdit className="text-yellow-400" />
                                </button>
                                <button
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Delete Template"
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
                onClose={() => setShowModal(false)}
                title="New Alert Template"
            >
                <form className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Template Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            placeholder="e.g., Critical Alert Email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Channel
                        </label>
                        <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]">
                            <option value="email">📧 Email</option>
                            <option value="slack">💬 Slack</option>
                            <option value="telegram">📱 Telegram</option>
                            <option value="pagerduty">📟 PagerDuty</option>
                            <option value="jira">📋 Jira</option>
                            <option value="discord">🔔 Discord</option>
                            <option value="webhook">🔗 Webhook</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Format
                        </label>
                        <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]">
                            <option value="html">HTML</option>
                            <option value="text">Plain Text</option>
                            <option value="json">JSON</option>
                            <option value="blocks">Slack Blocks</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            placeholder="Subject line template"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Body Template
                        </label>
                        <textarea
                            rows={4}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF] font-mono text-sm"
                            placeholder="Template body with {{.Variables}}"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Variables
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['ServerName', 'ServerIP', 'Status', 'Timestamp', 'Message', 'Action', 'Severity', 'AlertID'].map((v) => (
                                <Badge key={v} variant="purple" className="cursor-pointer">
                                    {`{{.${v}}}`}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Click to insert variable at cursor position
                        </p>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-white/10">
                        <Button type="submit" className="flex-1">Create Template</Button>
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AlertTemplates;
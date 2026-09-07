import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const IntegrationForm = ({ integration, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'slack',
        config: {},
        enabled: true,
        events: ['critical', 'high', 'warning']
    });

    useEffect(() => {
        if (integration) {
            setFormData({
                name: integration.name || '',
                type: integration.type || 'slack',
                config: integration.config || {},
                enabled: integration.enabled !== undefined ? integration.enabled : true,
                events: integration.events || ['critical', 'high', 'warning']
            });
        }
    }, [integration]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (integration) {
                await api.put(`/api/integrations/${integration.id}`, formData);
                toast.success('Integration updated successfully');
            } else {
                await api.post('/api/integrations', formData);
                toast.success('Integration created successfully');
            }
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save integration');
        } finally {
            setLoading(false);
        }
    };

    const eventOptions = [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'warning', label: 'Warning' },
        { value: 'info', label: 'Info' }
    ];

    const typeOptions = [
        { value: 'slack', label: 'Slack' },
        { value: 'email', label: 'Email' },
        { value: 'telegram', label: 'Telegram' },
        { value: 'pagerduty', label: 'PagerDuty' },
        { value: 'jira', label: 'Jira' },
        { value: 'discord', label: 'Discord' },
        { value: 'webhook', label: 'Webhook' }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Integration Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Integration"
                required
            />

            <Select
                label="Type"
                name="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={typeOptions}
            />

            <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                    Configuration (JSON)
                </label>
                <textarea
                    value={JSON.stringify(formData.config, null, 2)}
                    onChange={(e) => {
                        try {
                            const config = JSON.parse(e.target.value);
                            setFormData({ ...formData, config });
                        } catch (error) {
                            // Invalid JSON - ignore
                        }
                    }}
                    placeholder='{"webhook_url": "https://..."}'
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#6C63FF]"
                    rows={4}
                />
                <p className="text-xs text-gray-400 mt-1">
                    Enter configuration as valid JSON
                </p>
            </div>

            <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                    Events
                </label>
                <div className="flex flex-wrap gap-2">
                    {eventOptions.map((event) => (
                        <label key={event.value} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.events.includes(event.value)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormData({ ...formData, events: [...formData.events, event.value] });
                                    } else {
                                        setFormData({ ...formData, events: formData.events.filter(e => e !== event.value) });
                                    }
                                }}
                                className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                            />
                            <span className="text-sm text-gray-300">{event.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="rounded border-white/10 bg-white/5 text-[#6C63FF] focus:ring-[#6C63FF]"
                />
                <label className="text-gray-300 text-sm font-medium">Enable Integration</label>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-white/10">
                <Button type="submit" loading={loading} className="flex-1">
                    {integration ? 'Update Integration' : 'Create Integration'}
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default IntegrationForm;
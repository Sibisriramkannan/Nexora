import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLink, FaTest, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useApiPut, useApiPost } from '../../hooks/useApi';

const WebhookConfig = ({ integration, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [formData, setFormData] = useState({
        url: '',
        method: 'POST',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
        template: '',
        send_critical: true,
        send_warning: true,
        send_recovery: true,
        enabled: true
    });

    useEffect(() => {
        if (integration) {
            const config = integration.config || {};
            setFormData({
                url: config.url || '',
                method: config.method || 'POST',
                headers: config.headers || [{ key: 'Content-Type', value: 'application/json' }],
                template: config.template || '',
                send_critical: config.send_critical !== undefined ? config.send_critical : true,
                send_warning: config.send_warning !== undefined ? config.send_warning : true,
                send_recovery: config.send_recovery !== undefined ? config.send_recovery : true,
                enabled: integration.enabled !== undefined ? integration.enabled : true
            });
        }
    }, [integration]);

    const methodOptions = [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'PATCH', label: 'PATCH' },
        { value: 'DELETE', label: 'DELETE' }
    ];

    const updateMutation = useApiPut(
        integration ? `/api/integrations/${integration.id}` : '/api/integrations',
        {
            invalidate: ['integrations'],
            onSuccess: () => {
                toast.success('Webhook configuration saved successfully');
                onClose();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to save Webhook configuration');
            }
        }
    );

    const testMutation = useApiPost(
        integration ? `/api/integrations/${integration.id}/test` : '/api/integrations/test/webhook',
        {
            onSuccess: (data) => {
                setTestResult({ success: true, message: data.data?.message || 'Test successful!' });
                toast.success('Webhook test successful!');
            },
            onError: (error) => {
                setTestResult({ success: false, message: error.response?.data?.message || 'Test failed' });
                toast.error(error.response?.data?.message || 'Webhook test failed');
            }
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Filter out empty headers
        const headers = formData.headers.filter(h => h.key.trim() && h.value.trim());
        
        const data = {
            name: 'Webhook Integration',
            type: 'webhook',
            config: {
                url: formData.url,
                method: formData.method,
                headers: headers,
                template: formData.template,
                send_critical: formData.send_critical,
                send_warning: formData.send_warning,
                send_recovery: formData.send_recovery
            },
            enabled: formData.enabled,
            events: []
        };

        if (formData.send_critical) data.events.push('critical');
        if (formData.send_warning) data.events.push('warning');
        if (formData.send_recovery) data.events.push('recovery');

        updateMutation.mutate(data);
    };

    const handleTest = () => {
        setTesting(true);
        setTestResult(null);
        testMutation.mutate({
            url: formData.url,
            method: formData.method,
            headers: formData.headers.filter(h => h.key.trim() && h.value.trim())
        });
        setTimeout(() => setTesting(false), 1000);
    };

    const addHeader = () => {
        setFormData({
            ...formData,
            headers: [...formData.headers, { key: '', value: '' }]
        });
    };

    const removeHeader = (index) => {
        setFormData({
            ...formData,
            headers: formData.headers.filter((_, i) => i !== index)
        });
    };

    const updateHeader = (index, field, value) => {
        const newHeaders = [...formData.headers];
        newHeaders[index][field] = value;
        setFormData({ ...formData, headers: newHeaders });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-3xl">
                    <FaLink className="text-green-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Webhook Integration</h3>
                    <p className="text-sm text-gray-400">Configure custom webhook notifications</p>
                </div>
                <Badge variant={formData.enabled ? 'success' : 'default'} className="ml-auto">
                    {formData.enabled ? 'Active' : 'Disabled'}
                </Badge>
            </div>

            <Input
                label="Webhook URL"
                name="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://your-service.com/webhook"
                required
            />

            <Select
                label="HTTP Method"
                name="method"
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                options={methodOptions}
            />

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-300 text-sm font-medium">
                        Headers
                    </label>
                    <Button type="button" variant="secondary" size="sm" onClick={addHeader}>
                        <FaPlus className="mr-1" />
                        Add Header
                    </Button>
                </div>
                {formData.headers.map((header, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                        <Input
                            placeholder="Key"
                            value={header.key}
                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                            className="flex-1"
                        />
                        <Input
                            placeholder="Value"
                            value={header.value}
                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                            className="flex-1"
                        />
                        <button
                            type="button"
                            onClick={() => removeHeader(index)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <FaTrash className="text-red-400" />
                        </button>
                    </div>
                ))}
                <p className="text-xs text-gray-400 mt-1">
                    Add custom headers for authentication or content type
                </p>
            </div>

            <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                    Template (JSON)
                </label>
                <textarea
                    value={formData.template}
                    onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                    placeholder='{"message": "{{.Message}}", "severity": "{{.Severity}}"}'
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#6C63FF]"
                    rows={4}
                />
                <p className="text-xs text-gray-400 mt-1">
                    {'Use {{.Variable}} for dynamic values: Severity, Message, ServerName, Timestamp, etc.'}
                </p>
            </div>

            <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-medium">
                    Send Notifications For
                </label>
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={formData.send_critical}
                            onChange={(e) => setFormData({ ...formData, send_critical: e.target.checked })}
                            className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                        />
                        <span className="text-sm text-gray-300">Critical</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={formData.send_warning}
                            onChange={(e) => setFormData({ ...formData, send_warning: e.target.checked })}
                            className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                        />
                        <span className="text-sm text-gray-300">Warning</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={formData.send_recovery}
                            onChange={(e) => setFormData({ ...formData, send_recovery: e.target.checked })}
                            className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                        />
                        <span className="text-sm text-gray-300">Recovery</span>
                    </label>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                />
                <label className="text-gray-300 text-sm font-medium">Enable Integration</label>
            </div>

            {testResult && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl ${
                        testResult.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                    }`}
                >
                    <p className={`text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                        {testResult.success ? '✅ ' : '❌ '}{testResult.message}
                    </p>
                </motion.div>
            )}

            <div className="flex space-x-3 pt-4 border-t border-white/10">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleTest}
                    loading={testing}
                >
                    <FaTest className="mr-2" />
                    Test Webhook
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                    <FaSave className="mr-2" />
                    Save Configuration
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                    <FaTimes className="mr-2" />
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default WebhookConfig;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPager, FaTest, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useApiPut, useApiPost } from '../../hooks/useApi';

const PagerDutyConfig = ({ integration, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [formData, setFormData] = useState({
        service_key: '',
        service_name: 'Nexora Alerts',
        auto_resolve: true,
        send_critical: true,
        send_warning: false,
        send_recovery: true,
        enabled: true,
        severity_mapping: {
            critical: 'P1',
            high: 'P2',
            warning: 'P3',
            info: 'P4'
        }
    });

    useEffect(() => {
        if (integration) {
            const config = integration.config || {};
            setFormData({
                service_key: config.service_key || '',
                service_name: config.service_name || 'Nexora Alerts',
                auto_resolve: config.auto_resolve !== undefined ? config.auto_resolve : true,
                send_critical: config.send_critical !== undefined ? config.send_critical : true,
                send_warning: config.send_warning !== undefined ? config.send_warning : false,
                send_recovery: config.send_recovery !== undefined ? config.send_recovery : true,
                enabled: integration.enabled !== undefined ? integration.enabled : true,
                severity_mapping: config.severity_mapping || {
                    critical: 'P1',
                    high: 'P2',
                    warning: 'P3',
                    info: 'P4'
                }
            });
        }
    }, [integration]);

    const severityOptions = [
        { value: 'P1', label: 'P1 - Critical' },
        { value: 'P2', label: 'P2 - High' },
        { value: 'P3', label: 'P3 - Warning' },
        { value: 'P4', label: 'P4 - Info' }
    ];

    const updateMutation = useApiPut(
        integration ? `/api/integrations/${integration.id}` : '/api/integrations',
        {
            invalidate: ['integrations'],
            onSuccess: () => {
                toast.success('PagerDuty configuration saved successfully');
                onClose();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to save PagerDuty configuration');
            }
        }
    );

    const testMutation = useApiPost(
        integration ? `/api/integrations/${integration.id}/test` : '/api/integrations/test/pagerduty',
        {
            onSuccess: (data) => {
                setTestResult({ success: true, message: data.data?.message || 'Test successful!' });
                toast.success('PagerDuty test successful!');
            },
            onError: (error) => {
                setTestResult({ success: false, message: error.response?.data?.message || 'Test failed' });
                toast.error(error.response?.data?.message || 'PagerDuty test failed');
            }
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        
        const data = {
            name: 'PagerDuty Integration',
            type: 'pagerduty',
            config: {
                service_key: formData.service_key,
                service_name: formData.service_name,
                auto_resolve: formData.auto_resolve,
                send_critical: formData.send_critical,
                send_warning: formData.send_warning,
                send_recovery: formData.send_recovery,
                severity_mapping: formData.severity_mapping
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
            service_key: formData.service_key,
            service_name: formData.service_name
        });
        setTimeout(() => setTesting(false), 1000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#E7352D]/20 flex items-center justify-center text-3xl">
                    <FaPager className="text-[#E7352D]" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">PagerDuty Integration</h3>
                    <p className="text-sm text-gray-400">Configure PagerDuty alerts</p>
                </div>
                <Badge variant={formData.enabled ? 'success' : 'default'} className="ml-auto">
                    {formData.enabled ? 'Active' : 'Disabled'}
                </Badge>
            </div>

            <Input
                label="Service Key"
                name="service_key"
                type="password"
                value={formData.service_key}
                onChange={(e) => setFormData({ ...formData, service_key: e.target.value })}
                placeholder="12345678-9ABC-DEF0-1234-56789ABCDEF0"
                required
            />

            <Input
                label="Service Name"
                name="service_name"
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                placeholder="Nexora Alerts"
            />

            <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-medium">
                    Severity Mapping
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Critical →"
                        value={formData.severity_mapping.critical}
                        onChange={(e) => setFormData({
                            ...formData,
                            severity_mapping: { ...formData.severity_mapping, critical: e.target.value }
                        })}
                        options={severityOptions}
                    />
                    <Select
                        label="High →"
                        value={formData.severity_mapping.high}
                        onChange={(e) => setFormData({
                            ...formData,
                            severity_mapping: { ...formData.severity_mapping, high: e.target.value }
                        })}
                        options={severityOptions}
                    />
                    <Select
                        label="Warning →"
                        value={formData.severity_mapping.warning}
                        onChange={(e) => setFormData({
                            ...formData,
                            severity_mapping: { ...formData.severity_mapping, warning: e.target.value }
                        })}
                        options={severityOptions}
                    />
                    <Select
                        label="Info →"
                        value={formData.severity_mapping.info}
                        onChange={(e) => setFormData({
                            ...formData,
                            severity_mapping: { ...formData.severity_mapping, info: e.target.value }
                        })}
                        options={severityOptions}
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={formData.auto_resolve}
                        onChange={(e) => setFormData({ ...formData, auto_resolve: e.target.checked })}
                        className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                    />
                    <span className="text-sm text-gray-300">Auto-resolve alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={formData.send_critical}
                        onChange={(e) => setFormData({ ...formData, send_critical: e.target.checked })}
                        className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                    />
                    <span className="text-sm text-gray-300">Send Critical</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={formData.send_warning}
                        onChange={(e) => setFormData({ ...formData, send_warning: e.target.checked })}
                        className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                    />
                    <span className="text-sm text-gray-300">Send Warning</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={formData.send_recovery}
                        onChange={(e) => setFormData({ ...formData, send_recovery: e.target.checked })}
                        className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                    />
                    <span className="text-sm text-gray-300">Send Recovery</span>
                </label>
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
                    Test Connection
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

export default PagerDutyConfig;
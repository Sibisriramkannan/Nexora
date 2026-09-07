import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaTest, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useApiGet, useApiPut, useApiPost } from '../../hooks/useApi';

const EmailConfig = ({ integration, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [formData, setFormData] = useState({
        host: '',
        port: 587,
        username: '',
        password: '',
        from_email: '',
        from_name: 'Nexora Alerts',
        use_tls: true,
        use_starttls: true,
        send_critical: true,
        send_warning: true,
        send_recovery: true,
        enabled: true
    });

    useEffect(() => {
        if (integration) {
            const config = integration.config || {};
            setFormData({
                host: config.host || '',
                port: config.port || 587,
                username: config.username || '',
                password: config.password || '',
                from_email: config.from_email || '',
                from_name: config.from_name || 'Nexora Alerts',
                use_tls: config.use_tls !== undefined ? config.use_tls : true,
                use_starttls: config.use_starttls !== undefined ? config.use_starttls : true,
                send_critical: config.send_critical !== undefined ? config.send_critical : true,
                send_warning: config.send_warning !== undefined ? config.send_warning : true,
                send_recovery: config.send_recovery !== undefined ? config.send_recovery : true,
                enabled: integration.enabled !== undefined ? integration.enabled : true
            });
        }
    }, [integration]);

    const updateMutation = useApiPut(
        integration ? `/api/integrations/${integration.id}` : '/api/integrations',
        {
            invalidate: ['integrations'],
            onSuccess: () => {
                toast.success('Email configuration saved successfully');
                onClose();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to save Email configuration');
            }
        }
    );

    const testMutation = useApiPost(
        integration ? `/api/integrations/${integration.id}/test` : '/api/integrations/test/email',
        {
            onSuccess: (data) => {
                setTestResult({ success: true, message: data.data?.message || 'Test email sent!' });
                toast.success('Test email sent successfully!');
            },
            onError: (error) => {
                setTestResult({ success: false, message: error.response?.data?.message || 'Test failed' });
                toast.error(error.response?.data?.message || 'Email test failed');
            }
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        
        const data = {
            name: 'Email Integration',
            type: 'email',
            config: {
                host: formData.host,
                port: parseInt(formData.port),
                username: formData.username,
                password: formData.password,
                from_email: formData.from_email,
                from_name: formData.from_name,
                use_tls: formData.use_tls,
                use_starttls: formData.use_starttls,
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
            host: formData.host,
            port: formData.port,
            username: formData.username,
            password: formData.password,
            from_email: formData.from_email
        });
        setTimeout(() => setTesting(false), 1000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-3xl">
                    <FaEnvelope className="text-blue-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Email Integration</h3>
                    <p className="text-sm text-gray-400">Configure SMTP email notifications</p>
                </div>
                <Badge variant={formData.enabled ? 'success' : 'default'} className="ml-auto">
                    {formData.enabled ? 'Active' : 'Disabled'}
                </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="SMTP Host"
                    name="host"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    required
                />
                <Input
                    label="SMTP Port"
                    name="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    placeholder="587"
                    min="1"
                    max="65535"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="alerts@yourdomain.com"
                    required
                />
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="From Email"
                    name="from_email"
                    value={formData.from_email}
                    onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                    placeholder="alerts@yourdomain.com"
                    required
                />
                <Input
                    label="From Name"
                    name="from_name"
                    value={formData.from_name}
                    onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                    placeholder="Nexora Alerts"
                />
            </div>

            <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={formData.use_tls}
                        onChange={(e) => setFormData({ ...formData, use_tls: e.target.checked })}
                        className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                    />
                    <span className="text-sm text-gray-300">Use TLS</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={formData.use_starttls}
                        onChange={(e) => setFormData({ ...formData, use_starttls: e.target.checked })}
                        className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                    />
                    <span className="text-sm text-gray-300">Use StartTLS</span>
                </label>
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
                    Send Test Email
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

export default EmailConfig;
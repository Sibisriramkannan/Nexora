import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTelegramPlane, FaTest, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useApiPut, useApiPost } from '../../hooks/useApi';

const TelegramConfig = ({ integration, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [formData, setFormData] = useState({
        bot_token: '',
        chat_id: '',
        send_critical: true,
        send_warning: true,
        send_recovery: true,
        enabled: true
    });

    useEffect(() => {
        if (integration) {
            const config = integration.config || {};
            setFormData({
                bot_token: config.bot_token || '',
                chat_id: config.chat_id || '',
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
                toast.success('Telegram configuration saved successfully');
                onClose();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to save Telegram configuration');
            }
        }
    );

    const testMutation = useApiPost(
        integration ? `/api/integrations/${integration.id}/test` : '/api/integrations/test/telegram',
        {
            onSuccess: (data) => {
                setTestResult({ success: true, message: data.data?.message || 'Test message sent!' });
                toast.success('Telegram test successful!');
            },
            onError: (error) => {
                setTestResult({ success: false, message: error.response?.data?.message || 'Test failed' });
                toast.error(error.response?.data?.message || 'Telegram test failed');
            }
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        
        const data = {
            name: 'Telegram Integration',
            type: 'telegram',
            config: {
                bot_token: formData.bot_token,
                chat_id: formData.chat_id,
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
            bot_token: formData.bot_token,
            chat_id: formData.chat_id
        });
        setTimeout(() => setTesting(false), 1000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#0088CC]/20 flex items-center justify-center text-3xl">
                    <FaTelegramPlane className="text-[#0088CC]" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Telegram Integration</h3>
                    <p className="text-sm text-gray-400">Configure Telegram bot notifications</p>
                </div>
                <Badge variant={formData.enabled ? 'success' : 'default'} className="ml-auto">
                    {formData.enabled ? 'Active' : 'Disabled'}
                </Badge>
            </div>

            <Input
                label="Bot Token"
                name="bot_token"
                type="password"
                value={formData.bot_token}
                onChange={(e) => setFormData({ ...formData, bot_token: e.target.value })}
                placeholder="1234567890:ABC-DEF-..."
                required
            />

            <Input
                label="Chat ID"
                name="chat_id"
                value={formData.chat_id}
                onChange={(e) => setFormData({ ...formData, chat_id: e.target.value })}
                placeholder="-1001234567890"
                required
            />

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
                    Test Bot
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

export default TelegramConfig;
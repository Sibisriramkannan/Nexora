import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaJira, FaTest, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useApiPut, useApiPost } from '../../hooks/useApi';

const JiraConfig = ({ integration, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [formData, setFormData] = useState({
        url: '',
        project_key: '',
        issue_type: 'Task',
        username: '',
        api_token: '',
        auto_create_critical: true,
        auto_create_high: true,
        auto_close_on_recovery: true,
        enabled: true
    });

    useEffect(() => {
        if (integration) {
            const config = integration.config || {};
            setFormData({
                url: config.url || '',
                project_key: config.project_key || '',
                issue_type: config.issue_type || 'Task',
                username: config.username || '',
                api_token: config.api_token || '',
                auto_create_critical: config.auto_create_critical !== undefined ? config.auto_create_critical : true,
                auto_create_high: config.auto_create_high !== undefined ? config.auto_create_high : true,
                auto_close_on_recovery: config.auto_close_on_recovery !== undefined ? config.auto_close_on_recovery : true,
                enabled: integration.enabled !== undefined ? integration.enabled : true
            });
        }
    }, [integration]);

    const issueTypeOptions = [
        { value: 'Task', label: 'Task' },
        { value: 'Bug', label: 'Bug' },
        { value: 'Incident', label: 'Incident' },
        { value: 'Story', label: 'Story' }
    ];

    const updateMutation = useApiPut(
        integration ? `/api/integrations/${integration.id}` : '/api/integrations',
        {
            invalidate: ['integrations'],
            onSuccess: () => {
                toast.success('Jira configuration saved successfully');
                onClose();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to save Jira configuration');
            }
        }
    );

    const testMutation = useApiPost(
        integration ? `/api/integrations/${integration.id}/test` : '/api/integrations/test/jira',
        {
            onSuccess: (data) => {
                setTestResult({ success: true, message: data.data?.message || 'Connection successful!' });
                toast.success('Jira connection successful!');
            },
            onError: (error) => {
                setTestResult({ success: false, message: error.response?.data?.message || 'Connection failed' });
                toast.error(error.response?.data?.message || 'Jira connection failed');
            }
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        
        const data = {
            name: 'Jira Integration',
            type: 'jira',
            config: {
                url: formData.url,
                project_key: formData.project_key,
                issue_type: formData.issue_type,
                username: formData.username,
                api_token: formData.api_token,
                auto_create_critical: formData.auto_create_critical,
                auto_create_high: formData.auto_create_high,
                auto_close_on_recovery: formData.auto_close_on_recovery
            },
            enabled: formData.enabled,
            events: ['critical', 'high']
        };

        updateMutation.mutate(data);
    };

    const handleTest = () => {
        setTesting(true);
        setTestResult(null);
        testMutation.mutate({
            url: formData.url,
            project_key: formData.project_key,
            username: formData.username,
            api_token: formData.api_token
        });
        setTimeout(() => setTesting(false), 1000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#0052CC]/20 flex items-center justify-center text-3xl">
                    <FaJira className="text-[#0052CC]" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Jira Integration</h3>
                    <p className="text-sm text-gray-400">Configure Jira issue creation</p>
                </div>
                <Badge variant={formData.enabled ? 'success' : 'default'} className="ml-auto">
                    {formData.enabled ? 'Active' : 'Disabled'}
                </Badge>
            </div>

            <Input
                label="Jira URL"
                name="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://yourcompany.atlassian.net"
                required
            />

            <Input
                label="Project Key"
                name="project_key"
                value={formData.project_key}
                onChange={(e) => setFormData({ ...formData, project_key: e.target.value })}
                placeholder="PROJ"
                required
            />

            <Select
                label="Issue Type"
                name="issue_type"
                value={formData.issue_type}
                onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                options={issueTypeOptions}
            />

            <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin@yourcompany.com"
                required
            />

            <Input
                label="API Token"
                name="api_token"
                type="password"
                value={formData.api_token}
                onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                placeholder="••••••••"
                required
            />

            <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={formData.auto_create_critical}
                        onChange={(e) => setFormData({ ...formData, auto_create_critical: e.target.checked })}
                        className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                    />
                    <span className="text-sm text-gray-300">Auto-create for Critical</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={formData.auto_create_high}
                        onChange={(e) => setFormData({ ...formData, auto_create_high: e.target.checked })}
                        className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                    />
                    <span className="text-sm text-gray-300">Auto-create for High</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={formData.auto_close_on_recovery}
                        onChange={(e) => setFormData({ ...formData, auto_close_on_recovery: e.target.checked })}
                        className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                    />
                    <span className="text-sm text-gray-300">Auto-close on recovery</span>
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

export default JiraConfig;
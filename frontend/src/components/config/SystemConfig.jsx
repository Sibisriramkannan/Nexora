import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { useApiPut, useApiGet } from '../../hooks/useApi';

const SystemConfig = () => {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        name: 'Nexora',
        environment: 'production',
        timezone: 'Asia/Kolkata',
        base_url: 'http://localhost:8080',
        log_level: 'info',
        debug: false
    });

    const { data, isLoading } = useApiGet('systemConfig', '/config/system');

    useEffect(() => {
        if (data?.data) {
            setConfig(data.data);
        }
    }, [data]);

    const updateMutation = useApiPut('/config/system', {
        invalidate: ['systemConfig'],
        onSuccess: () => toast.success('System configuration updated'),
        onError: () => toast.error('Failed to update configuration')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(config);
    };

    const environmentOptions = [
        { value: 'development', label: 'Development' },
        { value: 'staging', label: 'Staging' },
        { value: 'production', label: 'Production' }
    ];

    const timezoneOptions = [
        { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
        { value: 'America/New_York', label: 'America/New_York' },
        { value: 'Europe/London', label: 'Europe/London' },
        { value: 'Asia/Singapore', label: 'Asia/Singapore' },
        { value: 'Asia/Tokyo', label: 'Asia/Tokyo' }
    ];

    const logLevelOptions = [
        { value: 'debug', label: 'Debug' },
        { value: 'info', label: 'Info' },
        { value: 'warn', label: 'Warning' },
        { value: 'error', label: 'Error' }
    ];

    if (isLoading) {
        return <div className="text-center py-8 text-gray-400">Loading configuration...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="System Name"
                name="name"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="Enter system name"
                required
            />

            <Select
                label="Environment"
                name="environment"
                value={config.environment}
                onChange={(e) => setConfig({ ...config, environment: e.target.value })}
                options={environmentOptions}
            />

            <Select
                label="Timezone"
                name="timezone"
                value={config.timezone}
                onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                options={timezoneOptions}
            />

            <Input
                label="Base URL"
                name="base_url"
                value={config.base_url}
                onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
                placeholder="https://nexora.yourdomain.com"
            />

            <Select
                label="Log Level"
                name="log_level"
                value={config.log_level}
                onChange={(e) => setConfig({ ...config, log_level: e.target.value })}
                options={logLevelOptions}
            />

            <div className="flex items-center space-x-3">
                <input
                    type="checkbox"
                    checked={config.debug}
                    onChange={(e) => setConfig({ ...config, debug: e.target.checked })}
                    className="rounded border-white/10 bg-white/5 text-[#6C63FF] focus:ring-[#6C63FF]"
                />
                <label className="text-gray-300 text-sm font-medium">Enable Debug Mode</label>
            </div>

            <Button type="submit" loading={updateMutation.isLoading}>
                Save System Configuration
            </Button>
        </form>
    );
};

export default SystemConfig;
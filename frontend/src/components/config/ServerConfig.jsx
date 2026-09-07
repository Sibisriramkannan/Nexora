import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import { useApiPut, useApiGet } from '../../hooks/useApi';

const ServerConfig = () => {
    const [config, setConfig] = useState({
        default_interval: 60,
        default_timeout: 10,
        default_retries: 3,
        auto_discovery: true,
        discovery_interval: 3600,
        discovery_network: '192.168.1.0/24'
    });

    const { data, isLoading } = useApiGet('serverConfig', '/config/server');

    useEffect(() => {
        if (data?.data) {
            setConfig(data.data);
        }
    }, [data]);

    const updateMutation = useApiPut('/config/server', {
        invalidate: ['serverConfig'],
        onSuccess: () => toast.success('Server configuration updated'),
        onError: () => toast.error('Failed to update configuration')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(config);
    };

    if (isLoading) {
        return <div className="text-center py-8 text-gray-400">Loading configuration...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Default Check Interval (seconds)"
                    name="default_interval"
                    type="number"
                    value={config.default_interval}
                    onChange={(e) => setConfig({ ...config, default_interval: parseInt(e.target.value) })}
                    min="10"
                    max="3600"
                />
                <Input
                    label="Default Timeout (seconds)"
                    name="default_timeout"
                    type="number"
                    value={config.default_timeout}
                    onChange={(e) => setConfig({ ...config, default_timeout: parseInt(e.target.value) })}
                    min="1"
                    max="60"
                />
            </div>

            <Input
                label="Default Retries"
                name="default_retries"
                type="number"
                value={config.default_retries}
                onChange={(e) => setConfig({ ...config, default_retries: parseInt(e.target.value) })}
                min="0"
                max="10"
            />

            <div className="flex items-center space-x-3">
                <input
                    type="checkbox"
                    checked={config.auto_discovery}
                    onChange={(e) => setConfig({ ...config, auto_discovery: e.target.checked })}
                    className="rounded border-white/10 bg-white/5 text-[#6C63FF] focus:ring-[#6C63FF]"
                />
                <label className="text-gray-300 text-sm font-medium">Enable Auto-Discovery</label>
            </div>

            <Input
                label="Discovery Interval (seconds)"
                name="discovery_interval"
                type="number"
                value={config.discovery_interval}
                onChange={(e) => setConfig({ ...config, discovery_interval: parseInt(e.target.value) })}
                min="60"
                max="86400"
            />

            <Input
                label="Discovery Network"
                name="discovery_network"
                value={config.discovery_network}
                onChange={(e) => setConfig({ ...config, discovery_network: e.target.value })}
                placeholder="192.168.1.0/24"
            />

            <Button type="submit" loading={updateMutation.isLoading}>
                Save Server Configuration
            </Button>
        </form>
    );
};

export default ServerConfig;
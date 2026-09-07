import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import { useApiPut, useApiGet } from '../../hooks/useApi';

const MonitorConfig = () => {
    const [config, setConfig] = useState({
        http_timeout: 10,
        ping_timeout: 5,
        ssl_warn_days: 7,
        ssl_critical_days: 3,
        max_checks: 100,
        check_interval: 60
    });

    const { data, isLoading } = useApiGet('monitorConfig', '/config/monitor');

    useEffect(() => {
        if (data?.data) {
            setConfig(data.data);
        }
    }, [data]);

    const updateMutation = useApiPut('/config/monitor', {
        invalidate: ['monitorConfig'],
        onSuccess: () => toast.success('Monitor configuration updated'),
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
                    label="HTTP Timeout (seconds)"
                    name="http_timeout"
                    type="number"
                    value={config.http_timeout}
                    onChange={(e) => setConfig({ ...config, http_timeout: parseInt(e.target.value) })}
                    min="1"
                    max="60"
                />
                <Input
                    label="Ping Timeout (seconds)"
                    name="ping_timeout"
                    type="number"
                    value={config.ping_timeout}
                    onChange={(e) => setConfig({ ...config, ping_timeout: parseInt(e.target.value) })}
                    min="1"
                    max="30"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="SSL Warning Days"
                    name="ssl_warn_days"
                    type="number"
                    value={config.ssl_warn_days}
                    onChange={(e) => setConfig({ ...config, ssl_warn_days: parseInt(e.target.value) })}
                    min="1"
                    max="30"
                />
                <Input
                    label="SSL Critical Days"
                    name="ssl_critical_days"
                    type="number"
                    value={config.ssl_critical_days}
                    onChange={(e) => setConfig({ ...config, ssl_critical_days: parseInt(e.target.value) })}
                    min="1"
                    max="30"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Max Concurrent Checks"
                    name="max_checks"
                    type="number"
                    value={config.max_checks}
                    onChange={(e) => setConfig({ ...config, max_checks: parseInt(e.target.value) })}
                    min="1"
                    max="1000"
                />
                <Input
                    label="Check Interval (seconds)"
                    name="check_interval"
                    type="number"
                    value={config.check_interval}
                    onChange={(e) => setConfig({ ...config, check_interval: parseInt(e.target.value) })}
                    min="10"
                    max="3600"
                />
            </div>

            <Button type="submit" loading={updateMutation.isLoading}>
                Save Monitor Configuration
            </Button>
        </form>
    );
};

export default MonitorConfig;
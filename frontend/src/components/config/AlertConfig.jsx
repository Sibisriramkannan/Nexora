import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import { useApiPut, useApiGet } from '../../hooks/useApi';

const AlertConfig = () => {
    const [config, setConfig] = useState({
        deduplicate: true,
        dedup_window: 3600,
        flapping_threshold: 3,
        recovery_confirms: 3,
        max_alerts_per_hour: 100,
        notification_cooldown: 300
    });

    const { data, isLoading } = useApiGet('alertConfig', '/config/alert');

    useEffect(() => {
        if (data?.data) {
            setConfig(data.data);
        }
    }, [data]);

    const updateMutation = useApiPut('/config/alert', {
        invalidate: ['alertConfig'],
        onSuccess: () => toast.success('Alert configuration updated'),
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
            <div className="flex items-center space-x-3">
                <input
                    type="checkbox"
                    checked={config.deduplicate}
                    onChange={(e) => setConfig({ ...config, deduplicate: e.target.checked })}
                    className="rounded border-white/10 bg-white/5 text-[#6C63FF] focus:ring-[#6C63FF]"
                />
                <label className="text-gray-300 text-sm font-medium">Enable Deduplication</label>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Deduplication Window (seconds)"
                    name="dedup_window"
                    type="number"
                    value={config.dedup_window}
                    onChange={(e) => setConfig({ ...config, dedup_window: parseInt(e.target.value) })}
                    min="60"
                    max="86400"
                />
                <Input
                    label="Flapping Threshold"
                    name="flapping_threshold"
                    type="number"
                    value={config.flapping_threshold}
                    onChange={(e) => setConfig({ ...config, flapping_threshold: parseInt(e.target.value) })}
                    min="1"
                    max="10"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Recovery Confirmations"
                    name="recovery_confirms"
                    type="number"
                    value={config.recovery_confirms}
                    onChange={(e) => setConfig({ ...config, recovery_confirms: parseInt(e.target.value) })}
                    min="1"
                    max="10"
                />
                <Input
                    label="Max Alerts Per Hour"
                    name="max_alerts_per_hour"
                    type="number"
                    value={config.max_alerts_per_hour}
                    onChange={(e) => setConfig({ ...config, max_alerts_per_hour: parseInt(e.target.value) })}
                    min="1"
                    max="1000"
                />
            </div>

            <Input
                label="Notification Cooldown (seconds)"
                name="notification_cooldown"
                type="number"
                value={config.notification_cooldown}
                onChange={(e) => setConfig({ ...config, notification_cooldown: parseInt(e.target.value) })}
                min="30"
                max="3600"
            />

            <Button type="submit" loading={updateMutation.isLoading}>
                Save Alert Configuration
            </Button>
        </form>
    );
};

export default AlertConfig;
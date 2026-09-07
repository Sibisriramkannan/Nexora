import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const MonitorForm = ({ monitor, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [servers, setServers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        type: 'http',
        target: '',
        port: '',
        interval: 60,
        timeout: 10,
        retries: 3,
        thresholds: {
            warning: 2000,
            critical: 5000
        },
        config: {},
        server_id: ''
    });

    useEffect(() => {
        const fetchServers = async () => {
            try {
                const response = await api.get('/api/servers');
                setServers(response.data.data || []);
            } catch (error) {
                console.error('Error fetching servers:', error);
            }
        };
        fetchServers();

        if (monitor) {
            setFormData({
                name: monitor.name || '',
                type: monitor.type || 'http',
                target: monitor.target || '',
                port: monitor.port || '',
                interval: monitor.interval || 60,
                timeout: monitor.timeout || 10,
                retries: monitor.retries || 3,
                thresholds: monitor.thresholds || { warning: 2000, critical: 5000 },
                config: monitor.config || {},
                server_id: monitor.server_id || ''
            });
        }
    }, [monitor]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (monitor) {
                await api.put(`/api/monitors/${monitor.id}`, formData);
                toast.success('Monitor updated successfully');
            } else {
                await api.post('/api/monitors', formData);
                toast.success('Monitor created successfully');
            }
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save monitor');
        } finally {
            setLoading(false);
        }
    };

    const monitorTypes = [
        { value: 'http', label: 'HTTP' },
        { value: 'https', label: 'HTTPS' },
        { value: 'ping', label: 'Ping' },
        { value: 'tcp', label: 'TCP' },
        { value: 'dns', label: 'DNS' }
    ];

    const serverOptions = [
        { value: '', label: 'None' },
        ...servers.map(server => ({
            value: server.id,
            label: `${server.name} (${server.ip_address})`
        }))
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Monitor Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter monitor name"
                required
            />

            <Select
                label="Type"
                name="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={monitorTypes}
                required
            />

            <Input
                label="Target"
                name="target"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                placeholder="e.g., google.com or 192.168.1.1"
                required
            />

            <Input
                label="Port (Optional)"
                name="port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                placeholder="e.g., 80, 443"
                min="1"
                max="65535"
            />

            <Select
                label="Server (Optional)"
                name="server_id"
                value={formData.server_id}
                onChange={(e) => setFormData({ ...formData, server_id: e.target.value })}
                options={serverOptions}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Interval (seconds)"
                    name="interval"
                    type="number"
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                    min="10"
                    max="3600"
                />
                <Input
                    label="Timeout (seconds)"
                    name="timeout"
                    type="number"
                    value={formData.timeout}
                    onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                    min="1"
                    max="60"
                />
            </div>

            <Input
                label="Retries"
                name="retries"
                type="number"
                value={formData.retries}
                onChange={(e) => setFormData({ ...formData, retries: parseInt(e.target.value) })}
                min="0"
                max="10"
            />

            <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-medium">Thresholds (ms)</label>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Warning"
                        name="warning"
                        type="number"
                        value={formData.thresholds.warning}
                        onChange={(e) => setFormData({
                            ...formData,
                            thresholds: { ...formData.thresholds, warning: parseInt(e.target.value) }
                        })}
                        min="100"
                        step="100"
                    />
                    <Input
                        label="Critical"
                        name="critical"
                        type="number"
                        value={formData.thresholds.critical}
                        onChange={(e) => setFormData({
                            ...formData,
                            thresholds: { ...formData.thresholds, critical: parseInt(e.target.value) }
                        })}
                        min="100"
                        step="100"
                    />
                </div>
            </div>

            {(formData.type === 'http' || formData.type === 'https') && (
                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                        HTTP Configuration (JSON)
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
                        placeholder='{"method": "GET", "headers": {"Authorization": "Bearer token"}}'
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#6C63FF]"
                        rows={4}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Configure HTTP method, headers, and body for the request
                    </p>
                </div>
            )}

            <div className="flex space-x-3 pt-4 border-t border-white/10">
                <Button type="submit" loading={loading} className="flex-1">
                    {monitor ? 'Update Monitor' : 'Create Monitor'}
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default MonitorForm;
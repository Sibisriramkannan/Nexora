import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import { useApiPut, useApiGet } from '../../hooks/useApi';

const SecurityConfig = () => {
    const [config, setConfig] = useState({
        mfa_enabled: true,
        session_timeout: 86400,
        max_login_attempts: 5,
        password_policy: {
            min_length: 8,
            require_uppercase: true,
            require_lowercase: true,
            require_numbers: true,
            require_special: true,
            expire_days: 90
        }
    });

    const { data, isLoading } = useApiGet('securityConfig', '/config/security');

    useEffect(() => {
        if (data?.data) {
            setConfig(data.data);
        }
    }, [data]);

    const updateMutation = useApiPut('/config/security', {
        invalidate: ['securityConfig'],
        onSuccess: () => toast.success('Security configuration updated'),
        onError: () => toast.error('Failed to update configuration')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(config);
    };

    const handlePolicyChange = (key, value) => {
        setConfig({
            ...config,
            password_policy: {
                ...config.password_policy,
                [key]: value
            }
        });
    };

    if (isLoading) {
        return <div className="text-center py-8 text-gray-400">Loading configuration...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-3">
                <input
                    type="checkbox"
                    checked={config.mfa_enabled}
                    onChange={(e) => setConfig({ ...config, mfa_enabled: e.target.checked })}
                    className="rounded border-white/10 bg-white/5 text-[#6C63FF] focus:ring-[#6C63FF]"
                />
                <label className="text-gray-300 text-sm font-medium">Enable MFA</label>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Session Timeout (seconds)"
                    name="session_timeout"
                    type="number"
                    value={config.session_timeout}
                    onChange={(e) => setConfig({ ...config, session_timeout: parseInt(e.target.value) })}
                    min="3600"
                    max="604800"
                />
                <Input
                    label="Max Login Attempts"
                    name="max_login_attempts"
                    type="number"
                    value={config.max_login_attempts}
                    onChange={(e) => setConfig({ ...config, max_login_attempts: parseInt(e.target.value) })}
                    min="3"
                    max="10"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-medium">Password Policy</label>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Minimum Length"
                        type="number"
                        value={config.password_policy.min_length}
                        onChange={(e) => handlePolicyChange('min_length', parseInt(e.target.value))}
                        min="6"
                        max="20"
                    />
                    <Input
                        label="Expire Days"
                        type="number"
                        value={config.password_policy.expire_days}
                        onChange={(e) => handlePolicyChange('expire_days', parseInt(e.target.value))}
                        min="30"
                        max="365"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={config.password_policy.require_uppercase}
                            onChange={(e) => handlePolicyChange('require_uppercase', e.target.checked)}
                            className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                        />
                        <span className="text-sm text-gray-300">Require Uppercase</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={config.password_policy.require_lowercase}
                            onChange={(e) => handlePolicyChange('require_lowercase', e.target.checked)}
                            className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                        />
                        <span className="text-sm text-gray-300">Require Lowercase</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={config.password_policy.require_numbers}
                            onChange={(e) => handlePolicyChange('require_numbers', e.target.checked)}
                            className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                        />
                        <span className="text-sm text-gray-300">Require Numbers</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={config.password_policy.require_special}
                            onChange={(e) => handlePolicyChange('require_special', e.target.checked)}
                            className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                        />
                        <span className="text-sm text-gray-300">Require Special Characters</span>
                    </label>
                </div>
            </div>

            <Button type="submit" loading={updateMutation.isLoading}>
                Save Security Configuration
            </Button>
        </form>
    );
};

export default SecurityConfig;
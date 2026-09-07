import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    FaServer, FaGlobe, FaBell, FaShieldAlt, FaPlug, 
    FaPalette, FaDownload, FaUpload, FaSave
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Config = () => {
    const [activeTab, setActiveTab] = useState('system');
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        system: {
            name: 'Nexora',
            environment: 'production',
            timezone: 'Asia/Kolkata',
            base_url: 'http://localhost:8080'
        },
        server: {
            default_interval: 60,
            default_timeout: 10,
            default_retries: 3,
            auto_discovery: true
        },
        monitor: {
            http_timeout: 10,
            ping_timeout: 5,
            ssl_warn_days: 7,
            ssl_critical_days: 3
        },
        alert: {
            deduplicate: true,
            dedup_window: 3600,
            flapping_threshold: 3,
            recovery_confirms: 3
        },
        security: {
            mfa_enabled: true,
            session_timeout: 86400,
            max_login_attempts: 5,
            password_policy: {
                min_length: 8,
                require_uppercase: true,
                require_numbers: true,
                require_special: true
            }
        },
        integrations: {
            slack_enabled: false,
            slack_webhook: '',
            email_enabled: false,
            email_host: '',
            email_port: 587,
            email_user: '',
            telegram_enabled: false,
            telegram_bot_token: ''
        }
    });

    const tabs = [
        { id: 'system', label: 'System', icon: <FaServer /> },
        { id: 'server', label: 'Server', icon: <FaServer /> },
        { id: 'monitor', label: 'Monitor', icon: <FaGlobe /> },
        { id: 'alert', label: 'Alert', icon: <FaBell /> },
        { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
        { id: 'integrations', label: 'Integrations', icon: <FaPlug /> }
    ];

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put('/api/config', config);
            toast.success('Configuration saved successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(config, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'nexora_config.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                setConfig(imported);
                toast.success('Configuration imported successfully');
            } catch (error) {
                toast.error('Invalid configuration file');
            }
        };
        reader.readAsText(file);
    };

    const renderConfigFields = () => {
        switch(activeTab) {
            case 'system':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                System Name
                            </label>
                            <input
                                type="text"
                                value={config.system.name}
                                onChange={(e) => setConfig({
                                    ...config,
                                    system: { ...config.system, name: e.target.value }
                                })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Environment
                            </label>
                            <select
                                value={config.system.environment}
                                onChange={(e) => setConfig({
                                    ...config,
                                    system: { ...config.system, environment: e.target.value }
                                })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            >
                                <option value="development">Development</option>
                                <option value="staging">Staging</option>
                                <option value="production">Production</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Timezone
                            </label>
                            <select
                                value={config.system.timezone}
                                onChange={(e) => setConfig({
                                    ...config,
                                    system: { ...config.system, timezone: e.target.value }
                                })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            >
                                <option value="Asia/Kolkata">Asia/Kolkata</option>
                                <option value="America/New_York">America/New_York</option>
                                <option value="Europe/London">Europe/London</option>
                                <option value="Asia/Singapore">Asia/Singapore</option>
                                <option value="Asia/Tokyo">Asia/Tokyo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Base URL
                            </label>
                            <input
                                type="text"
                                value={config.system.base_url}
                                onChange={(e) => setConfig({
                                    ...config,
                                    system: { ...config.system, base_url: e.target.value }
                                })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            />
                        </div>
                    </div>
                );
            
            case 'server':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Default Check Interval (seconds)
                            </label>
                            <input
                                type="number"
                                value={config.server.default_interval}
                                onChange={(e) => setConfig({
                                    ...config,
                                    server: { ...config.server, default_interval: parseInt(e.target.value) }
                                })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Default Timeout (seconds)
                            </label>
                            <input
                                type="number"
                                value={config.server.default_timeout}
                                onChange={(e) => setConfig({
                                    ...config,
                                    server: { ...config.server, default_timeout: parseInt(e.target.value) }
                                })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Default Retries
                            </label>
                            <input
                                type="number"
                                value={config.server.default_retries}
                                onChange={(e) => setConfig({
                                    ...config,
                                    server: { ...config.server, default_retries: parseInt(e.target.value) }
                                })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={config.server.auto_discovery}
                                onChange={(e) => setConfig({
                                    ...config,
                                    server: { ...config.server, auto_discovery: e.target.checked }
                                })}
                                className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#6C63FF] focus:ring-[#6C63FF]"
                            />
                            <label className="text-gray-300 text-sm font-medium">
                                Enable Auto-Discovery
                            </label>
                        </div>
                    </div>
                );

            case 'alert':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={config.alert.deduplicate}
                                onChange={(e) => setConfig({
                                    ...config,
                                    alert: { ...config.alert, deduplicate: e.target.checked }
                                })}
                                className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#6C63FF] focus:ring-[#6C63FF]"
                            />
                            <label className="text-gray-300 text-sm font-medium">
                                Enable Deduplication
                            </label>
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Deduplication Window (seconds)
                            </label>
                            <input
                                type="number"
                                value={config.alert.dedup_window}
                                onChange={(e) => setConfig({
                                    ...config,
                                    alert: { ...config.alert, dedup_window: parseInt(e.target.value) }
                                })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Flapping Threshold
                            </label>
                            <input
                                type="number"
                                value={config.alert.flapping_threshold}
                                onChange={(e) => setConfig({
                                    ...config,
                                    alert: { ...config.alert, flapping_threshold: parseInt(e.target.value) }
                                })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Recovery Confirmations
                            </label>
                            <input
                                type="number"
                                value={config.alert.recovery_confirms}
                                onChange={(e) => setConfig({
                                    ...config,
                                    alert: { ...config.alert, recovery_confirms: parseInt(e.target.value) }
                                })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                            />
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-10 text-gray-400">
                        <p>Configuration for {activeTab} tab</p>
                    </div>
                );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Configuration
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage system configuration settings
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
                    >
                        <FaDownload />
                        <span>Export</span>
                    </button>
                    <label className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors cursor-pointer">
                        <FaUpload />
                        <span>Import</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        <FaSave />
                        <span>{loading ? 'Saving...' : 'Save'}</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                            activeTab === tab.id
                                ? 'bg-gradient-to-r from-[#6C63FF]/20 to-[#00D4FF]/20 text-white border border-[#6C63FF]/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Config Content */}
            <div className="glass-card p-6 max-w-2xl">
                {renderConfigFields()}
            </div>

            {/* YAML Config View */}
            <div className="mt-6 glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    📄 Configuration File (YAML)
                </h3>
                <pre className="bg-black/30 p-4 rounded-xl text-gray-300 text-sm overflow-x-auto">
{`# Nexora Configuration
version: "1.0"

system:
  name: ${config.system.name}
  environment: ${config.system.environment}
  timezone: ${config.system.timezone}
  base_url: ${config.system.base_url}

server:
  default_interval: ${config.server.default_interval}
  default_timeout: ${config.server.default_timeout}
  default_retries: ${config.server.default_retries}
  auto_discovery: ${config.server.auto_discovery}

alert:
  deduplicate: ${config.alert.deduplicate}
  dedup_window: ${config.alert.dedup_window}
  flapping_threshold: ${config.alert.flapping_threshold}
  recovery_confirms: ${config.alert.recovery_confirms}`}
                </pre>
            </div>
        </motion.div>
    );
};

export default Config;
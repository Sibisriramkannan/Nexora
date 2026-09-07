import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaDownload, FaUpload, FaCopy, FaCheck } from 'react-icons/fa';
import Button from '../common/Button';
import { useApiGet, useApiPost } from '../../hooks/useApi';
import Card from '../common/Card';

const YAMLConfig = () => {
    const [yamlContent, setYamlContent] = useState('');
    const [copied, setCopied] = useState(false);

    const { data, isLoading } = useApiGet('yamlConfig', '/config/export');

    useEffect(() => {
        if (data?.data) {
            setYamlContent(JSON.stringify(data.data, null, 2));
        }
    }, [data]);

    const importMutation = useApiPost('/config/import', {
        invalidate: ['yamlConfig'],
        onSuccess: () => toast.success('Configuration imported successfully'),
        onError: () => toast.error('Failed to import configuration')
    });

    const handleImport = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target.result;
                const parsed = JSON.parse(content);
                importMutation.mutate(parsed);
            } catch (error) {
                toast.error('Invalid JSON format');
            }
        };
        reader.readAsText(file);
    };

    const handleExport = () => {
        const blob = new Blob([yamlContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nexora_config.json';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Configuration exported successfully');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(yamlContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied to clipboard');
    };

    if (isLoading) {
        return <div className="text-center py-8 text-gray-400">Loading configuration...</div>;
    }

    return (
        <div className="space-y-4">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Configuration File</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? <FaCheck className="text-green-400" /> : <FaCopy className="text-gray-400" />}
                        </button>
                        <button
                            onClick={handleExport}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Export configuration"
                        >
                            <FaDownload className="text-gray-400" />
                        </button>
                        <label className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                            <FaUpload className="text-gray-400" />
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                <pre className="bg-black/30 p-4 rounded-xl text-gray-300 text-sm font-mono overflow-x-auto max-h-96 overflow-y-auto">
                    {yamlContent || 'No configuration loaded'}
                </pre>

                <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                    <span>JSON format • {yamlContent?.length || 0} characters</span>
                    <span>Last updated: {new Date().toLocaleString()}</span>
                </div>
            </Card>

            <div className="flex space-x-3">
                <Button onClick={handleExport}>
                    <FaDownload className="mr-2" />
                    Export Config
                </Button>
                <label>
                    <Button variant="secondary">
                        <FaUpload className="mr-2" />
                        Import Config
                    </Button>
                    <input
                        type="file"
                        accept=".json,.yaml,.yml"
                        onChange={handleImport}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    );
};

export default YAMLConfig;
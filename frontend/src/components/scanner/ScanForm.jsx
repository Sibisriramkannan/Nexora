import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const ScanForm = ({ onClose }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'network',
        targets: '',
        options: {},
        schedule: ''
    });

    const [targetsList, setTargetsList] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                ...formData,
                targets: formData.targets.split(',').map(t => t.trim()).filter(t => t)
            };

            await api.post('/api/scanner', data);
            toast.success('Scan created successfully');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create scan');
        } finally {
            setLoading(false);
        }
    };

    const scanTypes = [
        { value: 'network', label: 'Network Scan' },
        { value: 'web', label: 'Web Application Scan' },
        { value: 'compliance', label: 'Compliance Scan' },
        { value: 'full', label: 'Full Scan' }
    ];

    const handleTargetsChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, targets: value });
        if (value.includes(',')) {
            const list = value.split(',').map(t => t.trim()).filter(t => t);
            setTargetsList(list);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Scan Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter scan name"
                required
            />

            <Select
                label="Scan Type"
                name="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={scanTypes}
                required
            />

            <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                    Targets <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={formData.targets}
                    onChange={handleTargetsChange}
                    placeholder="Enter targets (comma-separated)&#10;e.g., 192.168.1.10, 192.168.1.20, example.com"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#6C63FF] font-mono text-sm"
                    rows={3}
                    required
                />
                {targetsList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {targetsList.map((target, index) => (
                            <span key={index} className="px-2 py-1 bg-[#6C63FF]/20 rounded-lg text-xs text-white">
                                {target}
                            </span>
                        ))}
                    </div>
                )}
                <p className="text-xs text-gray-400 mt-1">
                    Enter IP addresses, hostnames, or URLs separated by commas
                </p>
            </div>

            <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                    Schedule (Optional)
                </label>
                <select
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C63FF]"
                >
                    <option value="">Run Now</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                </select>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-white/10">
                <Button type="submit" loading={loading} className="flex-1">
                    Create Scan
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default ScanForm;
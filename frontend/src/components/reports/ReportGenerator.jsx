import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFileAlt, FaCalendar, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Card from '../common/Card';
import Button from '../common/Button';
import Select from '../common/Select';
import Input from '../common/Input';

const ReportGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'uptime',
        format: 'pdf',
        timeRange: 'last30d',
        include: ['metrics', 'alerts', 'servers']
    });

    const reportTypes = [
        { value: 'uptime', label: 'Uptime Report' },
        { value: 'security', label: 'Security Report' },
        { value: 'compliance', label: 'Compliance Report' },
        { value: 'performance', label: 'Performance Report' },
        { value: 'sla', label: 'SLA Report' }
    ];

    const formatOptions = [
        { value: 'pdf', label: 'PDF' },
        { value: 'excel', label: 'Excel' },
        { value: 'csv', label: 'CSV' },
        { value: 'html', label: 'HTML' },
        { value: 'json', label: 'JSON' }
    ];

    const timeRangeOptions = [
        { value: 'last24h', label: 'Last 24 Hours' },
        { value: 'last7d', label: 'Last 7 Days' },
        { value: 'last30d', label: 'Last 30 Days' },
        { value: 'last90d', label: 'Last 90 Days' },
        { value: 'custom', label: 'Custom Range' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success('Report generated successfully!');
        }, 2000);
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Generate Report</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    label="Report Type"
                    name="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    options={reportTypes}
                    required
                />

                <Select
                    label="Format"
                    name="format"
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    options={formatOptions}
                    required
                />

                <Select
                    label="Time Range"
                    name="timeRange"
                    value={formData.timeRange}
                    onChange={(e) => setFormData({ ...formData, timeRange: e.target.value })}
                    options={timeRangeOptions}
                    required
                />

                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                        Include
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {['metrics', 'alerts', 'servers', 'vulnerabilities', 'compliance'].map((item) => (
                            <label key={item} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.include.includes(item)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFormData({ ...formData, include: [...formData.include, item] });
                                        } else {
                                            setFormData({ ...formData, include: formData.include.filter(i => i !== item) });
                                        }
                                    }}
                                    className="rounded border-white/10 bg-white/5 text-[#6C63FF]"
                                />
                                <span className="text-sm text-gray-300 capitalize">{item}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {formData.timeRange === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Start Date"
                            type="date"
                            value=""
                            onChange={() => {}}
                        />
                        <Input
                            label="End Date"
                            type="date"
                            value=""
                            onChange={() => {}}
                        />
                    </div>
                )}

                <Button type="submit" loading={loading}>
                    <FaFileAlt className="mr-2" />
                    Generate Report
                </Button>
            </form>
        </Card>
    );
};

export default ReportGenerator;
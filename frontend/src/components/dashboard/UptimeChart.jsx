import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const UptimeChart = ({ data, height = 300 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                No data available
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                    <p className="text-sm text-white">{label}</p>
                    <p className="text-sm text-[#6C63FF]">Uptime: {payload[0].value.toFixed(2)}%</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} domain={[95, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#888' }} iconType="circle" />
                <Area
                    type="monotone"
                    dataKey="uptime"
                    name="Uptime (%)"
                    stroke="#6C63FF"
                    fillOpacity={1}
                    fill="url(#colorUptime)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default UptimeChart;
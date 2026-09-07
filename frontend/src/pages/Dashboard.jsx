import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { FaServer, FaGlobe, FaShieldAlt, FaBell, FaPlus, FaSearch, FaArrowRight, FaCheckCircle, FaExclamationTriangle, FaBolt, FaChartLine, FaCog } from 'react-icons/fa';
import api from '../utils/api';
import UptimeChart from '../components/dashboard/UptimeChart';
import AlertList from '../components/dashboard/AlertList';
import SecurityScore from '../components/dashboard/SecurityScore';
import ServerMap from '../components/dashboard/ServerMap';
import { useWebSocket } from '../hooks/useWebSocket';

const Stat = ({ icon, label, value, detail, tone = 'indigo', onClick }) => (
    <motion.button whileHover={{ y: -2 }} onClick={onClick} className="nexora-card nexora-card-hover w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone === 'green' ? 'bg-emerald-500/10 text-emerald-500' : tone === 'red' ? 'bg-red-500/10 text-red-500' : tone === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'}`}>{icon}</div>
            <FaArrowRight className="mt-1 text-xs text-slate-300 dark:text-slate-600" />
        </div>
        <div className="mt-4 text-[26px] font-semibold tracking-tight text-slate-950 dark:text-white">{value}</div>
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div>
        <div className="mt-1 text-xs text-slate-400">{detail}</div>
    </motion.button>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [realtimeData, setRealtimeData] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [customizeOpen, setCustomizeOpen] = useState(false);
    const [widgets, setWidgets] = useState(() => {
        try { return JSON.parse(localStorage.getItem('nexora_dashboard_widgets')) || { trend: true, security: true, incidents: true, map: true, actions: true }; }
        catch { return { trend: true, security: true, incidents: true, map: true, actions: true }; }
    });
    const toggleWidget = (key) => setWidgets(prev => { const next = { ...prev, [key]: !prev[key] }; localStorage.setItem('nexora_dashboard_widgets', JSON.stringify(next)); return next; });
    const { messages } = useWebSocket();

    const { data: stats, isLoading, isError, refetch } = useQuery('dashboardStats', async () => {
        const response = await api.get('/api/dashboard/stats');
        return response.data.data;
    }, { refetchInterval: 30000 });

    const { data: uptimeData } = useQuery('uptimeData', async () => {
        const response = await api.get('/api/dashboard/uptime?days=7');
        return response.data.data;
    });

    useEffect(() => {
        if (messages.length) {
            const last = messages[messages.length - 1];
            if (last.type === 'metric_update') setRealtimeData(last.data);
            setLastUpdated(new Date());
        }
    }, [messages]);

    const health = useMemo(() => {
        const total = stats?.servers?.total || 0;
        const online = stats?.servers?.online || 0;
        return total ? Math.round((online / total) * 100) : 100;
    }, [stats]);

    if (isLoading) return <DashboardSkeleton />;

    if (isError) return (
        <div className="mx-auto max-w-xl py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500"><FaExclamationTriangle /></div>
            <h1 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Unable to load your overview</h1>
            <p className="mt-1 text-sm text-slate-500">The dashboard API did not respond successfully.</p>
            <button onClick={() => refetch()} className="nexora-btn-primary mt-5">Try again</button>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <div className="nexora-kicker">Operations overview</div>
                    <h1 className="nexora-page-title mt-1">Infrastructure health</h1>
                    <p className="nexora-page-subtitle">A live view of your servers, monitors, security and incidents.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-white/[0.07] dark:bg-[#0f1420] sm:flex"><span className="status-dot status-online animate-pulse" /> Live · {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <button onClick={() => navigate('/servers')} className="nexora-btn-secondary"><FaServer /> Servers</button>
                    <button onClick={() => setCustomizeOpen(v => !v)} className="nexora-btn-secondary"><FaCog /> Customize</button>
                    <button onClick={() => navigate('/monitors')} className="nexora-btn-primary"><FaPlus /> New monitor</button>
                </div>
            </section>

            {customizeOpen && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="nexora-card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-sm font-semibold text-slate-900 dark:text-white">Dashboard layout</div><div className="text-xs text-slate-400">Choose which overview panels you want to see. Your preference is saved locally.</div></div><div className="flex flex-wrap gap-2">{[['trend','Availability'],['security','Security'],['incidents','Incidents'],['map','Infrastructure'],['actions','Quick actions']].map(([key,label]) => <button key={key} onClick={() => toggleWidget(key)} className={`nexora-btn ${widgets[key] ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'bg-slate-100 text-slate-400 dark:bg-white/[0.04]'}`}>{widgets[key] ? '✓ ' : ''}{label}</button>)}</div></div>
            </motion.div>}

            <section className="nexora-card overflow-hidden border-indigo-500/10 bg-gradient-to-r from-indigo-500/[0.06] to-transparent p-5 dark:border-indigo-400/10">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500"><FaCheckCircle className="text-xl" /></div>
                        <div><div className="text-base font-semibold text-slate-900 dark:text-white">Systems are {health >= 95 ? 'healthy' : 'being monitored'}</div><div className="mt-0.5 text-sm text-slate-500">{health}% of registered servers are online right now.</div></div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 lg:min-w-[420px]">
                        <div><div className="text-xl font-semibold text-slate-900 dark:text-white">{stats?.servers?.online || 0}</div><div className="text-xs text-slate-400">Online</div></div>
                        <div><div className="text-xl font-semibold text-slate-900 dark:text-white">{stats?.monitors?.up || 0}</div><div className="text-xs text-slate-400">Monitors up</div></div>
                        <div><div className="text-xl font-semibold text-red-500">{stats?.alerts?.active || 0}</div><div className="text-xs text-slate-400">Active incidents</div></div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat icon={<FaServer />} label="Servers" value={stats?.servers?.total || 0} detail={`${stats?.servers?.online || 0} online · ${stats?.servers?.total - (stats?.servers?.online || 0) || 0} need attention`} onClick={() => navigate('/servers')} />
                <Stat icon={<FaGlobe />} label="Monitors" value={stats?.monitors?.total || 0} detail={`${stats?.monitors?.up || 0} operational`} tone="green" onClick={() => navigate('/monitors')} />
                <Stat icon={<FaShieldAlt />} label="Critical vulnerabilities" value={stats?.vulns?.critical || 0} detail={`${stats?.vulns?.total || 0} findings across scans`} tone="red" onClick={() => navigate('/scanner')} />
                <Stat icon={<FaBell />} label="Active incidents" value={stats?.alerts?.active || 0} detail={`${stats?.alerts?.today || 0} opened today`} tone="amber" onClick={() => navigate('/alerts')} />
            </section>

            {(widgets.trend || widgets.security) && <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                {widgets.trend && <div className="nexora-card p-5 xl:col-span-2">
                    <div className="mb-5 flex items-start justify-between gap-4"><div><div className="text-sm font-semibold text-slate-900 dark:text-white">Availability trend</div><div className="mt-1 text-xs text-slate-400">Last 7 days across monitored services</div></div><button onClick={() => navigate('/monitors')} className="nexora-btn-ghost text-xs">Explore <FaArrowRight /></button></div>
                    <UptimeChart data={uptimeData} height={280} />
                </div>
                {widgets.security && <div className="nexora-card p-5">
                    <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Security posture</div>
                    <div className="mb-3 text-xs text-slate-400">Current vulnerability exposure</div>
                    <SecurityScore score={stats?.security?.score || 72} details={{ critical: stats?.vulns?.critical || 0, high: stats?.vulns?.high || 0, medium: stats?.vulns?.medium || 0, low: stats?.vulns?.low || 0, patched: stats?.security?.patched || 0, in_progress: stats?.security?.in_progress || 0, pending: stats?.security?.pending || 0 }} />
                    <button onClick={() => navigate('/scanner')} className="nexora-btn-secondary mt-4 w-full">Open security center <FaArrowRight /></button>
                </div>}
            </section>}

            {(widgets.incidents || widgets.map) && <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
                {widgets.incidents && <div className="nexora-card p-5 xl:col-span-3">
                    <div className="mb-4 flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-900 dark:text-white">Active incidents</div><div className="mt-1 text-xs text-slate-400">Issues that may require action</div></div><button onClick={() => navigate('/alerts')} className="nexora-btn-ghost text-xs">View all <FaArrowRight /></button></div>
                    <AlertList alerts={stats?.recent_alerts || []} />
                </div>}
                {widgets.map && <div className="nexora-card p-5 xl:col-span-2">
                    <div className="mb-4 flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-900 dark:text-white">Infrastructure map</div><div className="mt-1 text-xs text-slate-400">Server distribution</div></div><FaChartLine className="text-indigo-500" /></div>
                    <ServerMap />
                </div>}
            </section>}

            {widgets.actions && <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button onClick={() => navigate('/servers')} className="nexora-card nexora-card-hover flex items-center gap-3 p-4 text-left"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500"><FaPlus /></span><span><span className="block text-sm font-semibold text-slate-800 dark:text-white">Add server</span><span className="text-xs text-slate-400">Install the Nexora agent</span></span></button>
                <button onClick={() => navigate('/monitors')} className="nexora-card nexora-card-hover flex items-center gap-3 p-4 text-left"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500"><FaSearch /></span><span><span className="block text-sm font-semibold text-slate-800 dark:text-white">Create monitor</span><span className="text-xs text-slate-400">Track uptime and response time</span></span></button>
                <button onClick={() => navigate('/scanner')} className="nexora-card nexora-card-hover flex items-center gap-3 p-4 text-left"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500"><FaBolt /></span><span><span className="block text-sm font-semibold text-slate-800 dark:text-white">Run security scan</span><span className="text-xs text-slate-400">Find exposed vulnerabilities</span></span></button>
            </section>}

            {realtimeData && <div className="text-right text-[11px] text-slate-400">Real-time telemetry connected</div>}
        </motion.div>
    );
};

const DashboardSkeleton = () => <div className="space-y-6"><div className="space-y-2"><div className="skeleton h-3 w-28" /><div className="skeleton h-8 w-64" /><div className="skeleton h-4 w-96 max-w-full" /></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="nexora-card p-4"><div className="skeleton h-9 w-9" /><div className="skeleton mt-5 h-8 w-16" /><div className="skeleton mt-2 h-4 w-24" /><div className="skeleton mt-2 h-3 w-32" /></div>)}</div><div className="grid grid-cols-1 gap-5 xl:grid-cols-3"><div className="nexora-card h-80 xl:col-span-2" /><div className="nexora-card h-80" /></div></div>;

export default Dashboard;

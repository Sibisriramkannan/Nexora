import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import {
    FaBell, FaSearch, FaMoon, FaSun, FaCog, FaSignOutAlt,
    FaUserCircle, FaChevronDown, FaServer,
    FaShieldAlt, FaArrowRight
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import api from '../../utils/api';

const Header = ({ sidebarOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [searchOpen, setSearchOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { data: alertStats } = useQuery('headerAlertStats', async () => {
        const response = await api.get('/alerts/stats');
        return response.data.data;
    }, { staleTime: 30000 });
    const { data: recentAlerts = [] } = useQuery('headerRecentAlerts', async () => {
        const response = await api.get('/alerts?limit=3');
        return response.data.data || [];
    }, { staleTime: 30000 });
    const searchRef = useRef(null);

    const notifications = recentAlerts.map(alert => ({
        id: alert.id,
        severity: alert.severity,
        title: alert.message || 'Alert triggered',
        detail: alert.Server?.name || alert.server?.name || 'Monitoring alert',
        time: alert.triggered_at ? new Date(alert.triggered_at).toLocaleString() : 'Recently'
    }));


    const commands = [
        { label: 'Go to Servers', icon: <FaServer />, path: '/servers' },
        { label: 'Go to Incidents', icon: <FaBell />, path: '/alerts' },
        { label: 'Open Security Center', icon: <FaShieldAlt />, path: '/scanner' },
        { label: 'Open Settings', icon: <FaCog />, path: '/config' },
    ];

    const filtered = commands.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        const handler = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setSearchOpen(true);
            }
            if (event.key === 'Escape') {
                setSearchOpen(false);
                setNotificationsOpen(false);
                setProfileOpen(false);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (searchOpen) setTimeout(() => searchRef.current?.focus(), 0);
    }, [searchOpen]);

    const openCommand = (path) => {
        setSearchOpen(false);
        setQuery('');
        navigate(path);
    };

    return (
        <header className="relative z-40 flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0b1018]/95 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <button onClick={toggleSidebar} className="nexora-btn-ghost hidden lg:flex" aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
                    <span className="text-lg">{sidebarOpen ? '‹' : '›'}</span>
                </button>
                <button onClick={() => setSearchOpen(true)} className="hidden h-9 w-full max-w-md items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 transition hover:border-slate-300 dark:border-white/[0.07] dark:bg-[#0f1520] dark:hover:border-white/[0.12] sm:flex">
                    <FaSearch className="text-xs" />
                    <span className="flex-1 text-left">Search Nexora...</span>
                    <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400 dark:border-white/[0.08] dark:bg-white/[0.04]">⌘ K</kbd>
                </button>
                <button onClick={() => setSearchOpen(true)} className="nexora-btn-ghost sm:hidden" aria-label="Search"><FaSearch /></button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <div className={`mr-1 hidden items-center gap-2 rounded-full border px-2.5 py-1.5 md:flex ${alertStats?.critical > 0 ? 'border-red-500/20 bg-red-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
                    <span className={`status-dot ${alertStats?.critical > 0 ? 'status-offline' : 'status-online'} ${alertStats?.critical > 0 ? '' : 'animate-pulse'}`} />
                    <span className={`text-xs font-medium ${alertStats?.critical > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{alertStats?.critical > 0 ? `${alertStats.critical} critical incident${alertStats.critical === 1 ? '' : 's'}` : 'No critical incidents'}</span>
                </div>
                <button onClick={toggleTheme} className="nexora-btn-ghost" aria-label="Toggle theme">
                    {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>
                <div className="relative">
                    <button onClick={() => { setNotificationsOpen(v => !v); setProfileOpen(false); }} className="nexora-btn-ghost relative" aria-label="Notifications">
                        <FaBell />
                        {notifications.length > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0b1018]" />}
                    </button>
                    <AnimatePresence>
                        {notificationsOpen && <motion.div initial={{ opacity: 0, y: 6, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-white/[0.08] dark:bg-[#101722]">
                            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/[0.06]">
                                <div><div className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</div><div className="text-xs text-slate-400">{notifications.length} recent event{notifications.length === 1 ? '' : 's'}</div></div>
                                <button onClick={() => navigate('/alerts')} className="text-xs font-medium text-indigo-500 hover:text-indigo-400">View all</button>
                            </div>
                            {notifications.length === 0 ? <div className="px-4 py-8 text-center text-sm text-slate-400">No recent alerts</div> : notifications.map(item => <button key={item.id} onClick={() => navigate('/alerts')} className="flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-white/[0.04] dark:hover:bg-white/[0.03]">
                                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.severity === 'critical' ? 'bg-red-500' : item.severity === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.title}</span><span className="block truncate text-xs text-slate-400">{item.detail} · {item.time}</span></span>
                            </button>)}
                            <button onClick={() => navigate('/alerts')} className="flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/5">View incident center <FaArrowRight /></button>
                        </motion.div>}
                    </AnimatePresence>
                </div>
                <div className="relative ml-1">
                    <button onClick={() => { setProfileOpen(v => !v); setNotificationsOpen(false); }} className="flex h-9 items-center gap-2 rounded-lg px-1.5 transition hover:bg-slate-100 dark:hover:bg-white/[0.04]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                        <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 dark:text-slate-200 md:block">{user?.name || 'User'}</span>
                        <FaChevronDown className="hidden text-[10px] text-slate-400 md:block" />
                    </button>
                    <AnimatePresence>
                        {profileOpen && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-white/[0.08] dark:bg-[#101722]">
                            <div className="border-b border-slate-100 px-3 py-2.5 dark:border-white/[0.06]"><div className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user?.name || 'User'}</div><div className="truncate text-xs text-slate-400">{user?.email || 'Account'}</div></div>
                            <button onClick={() => navigate('/config')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.04]"><FaUserCircle /> Profile & account</button>
                            <button onClick={() => navigate('/config')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.04]"><FaCog /> Settings</button>
                            <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><FaSignOutAlt /> Sign out</button>
                        </motion.div>}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {searchOpen && <motion.div className="fixed inset-0 z-[100] bg-slate-950/50 p-4 backdrop-blur-sm sm:p-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && setSearchOpen(false)}>
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mx-auto mt-[5vh] max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/[0.08] dark:bg-[#101722]">
                        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-white/[0.06]">
                            <FaSearch className="text-slate-400" /><input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && filtered[0]) openCommand(filtered[0].path); }} placeholder="Search servers, incidents, settings..." className="h-14 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 dark:text-white" /><kbd className="rounded border border-slate-200 px-2 py-1 text-[10px] text-slate-400 dark:border-white/[0.08]">ESC</kbd>
                        </div>
                        <div className="p-2"><div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Quick navigation</div>{filtered.map(item => <button key={item.path} onClick={() => openCommand(item.path)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.05]"><span className="text-slate-400">{item.icon}</span>{item.label}<FaArrowRight className="ml-auto text-xs text-slate-300" /></button>)}{filtered.length === 0 && <div className="px-3 py-8 text-center text-sm text-slate-400">No matching commands</div>}</div>
                        <div className="border-t border-slate-200 px-4 py-2 text-[11px] text-slate-400 dark:border-white/[0.06]">Use ↑ ↓ to navigate · Enter to open · Esc to close</div>
                    </motion.div>
                </motion.div>}
            </AnimatePresence>
        </header>
    );
};

export default Header;

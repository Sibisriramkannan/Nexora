import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaHome, FaServer, FaGlobe, FaShieldAlt, FaBell, FaPlug,
    FaCog, FaFileAlt, FaUsers, FaCloud, FaChevronLeft, FaChevronRight,
    FaSignOutAlt, FaChartLine, FaExclamationCircle
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { NexoraLogo } from '../../assets/branding/logo';

const groups = [
    { label: 'Overview', items: [
        { path: '/dashboard', icon: <FaHome />, label: 'Overview' },
        { path: '/alerts', icon: <FaExclamationCircle />, label: 'Incidents' },
    ]},
    { label: 'Infrastructure', items: [
        { path: '/servers', icon: <FaServer />, label: 'Servers' },
        { path: '/monitors', icon: <FaGlobe />, label: 'Monitors' },
        { path: '/cloud', icon: <FaCloud />, label: 'Cloud & Hybrid' },
    ]},
    { label: 'Security', items: [
        { path: '/scanner', icon: <FaShieldAlt />, label: 'Security Center' },
        { path: '/security/schedules', icon: <FaChartLine />, label: 'Scan Scheduler' },
    ]},
    { label: 'Management', items: [
        { path: '/integrations', icon: <FaPlug />, label: 'Integrations' },
        { path: '/reports', icon: <FaFileAlt />, label: 'Reports' },
        { path: '/config', icon: <FaCog />, label: 'Settings' },
    ]},
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { logout } = useAuth();
    return (
        <motion.aside
            initial={false}
            animate={{ width: isOpen ? 256 : 72 }}
            transition={{ duration: 0.2 }}
            className="hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white dark:border-white/[0.06] dark:bg-[#0b1018] lg:flex"
        >
            <div className="flex h-[68px] shrink-0 items-center border-b border-slate-200 px-4 dark:border-white/[0.06]">
                <div className="flex min-w-0 items-center gap-3">
                    <NexoraLogo className="h-9 w-9 shrink-0" />
                    {isOpen && <div className="min-w-0">
                        <div className="truncate text-[17px] font-semibold tracking-tight text-slate-950 dark:text-white">Nexora</div>
                        <div className="truncate text-[10px] font-medium uppercase tracking-[.14em] text-slate-400">Observability</div>
                    </div>}
                </div>
            </div>

            <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-5">
                {groups.map(group => (
                    <div key={group.label} className="mb-6">
                        {isOpen && <div className="nexora-kicker mb-2 px-3">{group.label}</div>}
                        <div className="space-y-1">
                            {group.items.map(item => (
                                <NavLink key={item.path} to={item.path} title={!isOpen ? item.label : undefined}
                                    className={({ isActive }) => `group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors ${isOpen ? '' : 'justify-center'} ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-white'}`}>
                                    {({ isActive }) => <>
                                        <span className={`text-[15px] ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`}>{item.icon}</span>
                                        {isOpen && <span className="truncate">{item.label}</span>}
                                        {isActive && <span className="absolute left-0 h-5 w-0.5 rounded-r bg-indigo-600" />}
                                    </>}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="shrink-0 border-t border-slate-200 p-3 dark:border-white/[0.06]">
                <button onClick={toggleSidebar} className="nexora-btn-ghost mb-1 w-full" title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
                    {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
                    {isOpen && <span>Collapse</span>}
                </button>
                <button onClick={logout} className={`nexora-btn-ghost w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 ${isOpen ? 'justify-start' : ''}`} title="Sign out">
                    <FaSignOutAlt />{isOpen && <span>Sign out</span>}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;

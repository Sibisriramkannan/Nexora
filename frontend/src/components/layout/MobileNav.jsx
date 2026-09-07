import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaServer, FaGlobe, FaShieldAlt, FaBell, FaPlug, FaCog, FaFileAlt, FaTimes, FaBars } from 'react-icons/fa';
import { NexoraLogo } from '../../assets/branding/logo';

const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Overview' },
    { path: '/servers', icon: <FaServer />, label: 'Servers' },
    { path: '/monitors', icon: <FaGlobe />, label: 'Monitors' },
    { path: '/alerts', icon: <FaBell />, label: 'Incidents' },
    { path: '/scanner', icon: <FaShieldAlt />, label: 'Security' },
    { path: '/integrations', icon: <FaPlug />, label: 'Integrations' },
    { path: '/reports', icon: <FaFileAlt />, label: 'Reports' },
    { path: '/config', icon: <FaCog />, label: 'Settings' }
];

const MobileNav = () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 lg:hidden" aria-label="Open navigation"><FaBars /></button>
        <AnimatePresence>{isOpen && <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 260 }} className="fixed right-0 top-0 z-[60] h-full w-[290px] border-l border-slate-200 bg-white shadow-2xl dark:border-white/[0.06] dark:bg-[#0b1018] lg:hidden">
                <div className="flex h-[68px] items-center justify-between border-b border-slate-200 px-4 dark:border-white/[0.06]"><div className="flex items-center gap-3"><NexoraLogo className="h-9 w-9" /><div><div className="font-semibold text-slate-900 dark:text-white">Nexora</div><div className="text-[10px] uppercase tracking-wider text-slate-400">Observability</div></div></div><button onClick={() => setIsOpen(false)} className="nexora-btn-ghost"><FaTimes /></button></div>
                <nav className="space-y-1 p-4">{menuItems.map(item => <NavLink key={item.path} to={item.path} onClick={() => setIsOpen(false)} className={({ isActive }) => `flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.04]'}`}><span className="text-slate-400">{item.icon}</span>{item.label}</NavLink>)}</nav>
            </motion.div>
        </>}</AnimatePresence>
    </>;
};
export default MobileNav;

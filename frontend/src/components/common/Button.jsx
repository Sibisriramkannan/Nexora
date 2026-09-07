import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', size = 'md', className = '', loading = false, disabled = false, ...props }) => {
    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-500',
        secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-white/[0.05]',
        danger: 'bg-red-600 text-white hover:bg-red-500',
        success: 'bg-emerald-600 text-white hover:bg-emerald-500',
        warning: 'bg-amber-500 text-white hover:bg-amber-400',
        outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.05]'
    };
    const sizes = { sm: 'h-8 px-2.5 text-xs', md: 'h-9 px-3 text-sm', lg: 'h-10 px-4 text-sm' };
    return <motion.button whileHover={{ y: disabled || loading ? 0 : -1 }} whileTap={{ scale: .98 }} className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className} ${disabled || loading ? 'cursor-not-allowed opacity-50' : ''}`} disabled={disabled || loading} {...props}>
        {loading ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /><span>Loading...</span></> : children}
    </motion.button>;
};
export default Button;

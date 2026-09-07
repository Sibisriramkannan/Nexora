import React from 'react';

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    className = '',
    ...props
}) => {
    const variants = {
        default: 'bg-gray-500/20 text-gray-300',
        success: 'bg-green-500/20 text-green-500',
        warning: 'bg-yellow-500/20 text-yellow-500',
        danger: 'bg-red-500/20 text-red-500',
        info: 'bg-blue-500/20 text-blue-500',
        purple: 'bg-purple-500/20 text-purple-500'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
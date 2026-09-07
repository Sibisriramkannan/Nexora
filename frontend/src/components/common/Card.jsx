import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
    children,
    className = '',
    hover = false,
    padding = true,
    ...props
}) => {
    const baseClasses = 'glass-card';
    const paddingClasses = padding ? 'p-6' : '';
    const hoverClasses = hover ? 'hover:scale-[1.02] transition-transform cursor-pointer' : '';

    return (
        <motion.div
            className={`${baseClasses} ${paddingClasses} ${hoverClasses} ${className}`}
            whileHover={hover ? { scale: 1.02 } : {}}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
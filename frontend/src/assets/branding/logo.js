// Logo SVG components
export const NexoraLogo = ({ className = 'w-10 h-10', variant = 'default' }) => {
    const colors = {
        default: {
            primary: '#6C63FF',
            secondary: '#00D4FF',
            text: '#FFFFFF'
        },
        dark: {
            primary: '#6C63FF',
            secondary: '#00D4FF',
            text: '#FFFFFF'
        },
        light: {
            primary: '#6C63FF',
            secondary: '#00D4FF',
            text: '#1A1A2E'
        }
    };

    const c = colors[variant] || colors.default;

    return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background circle with gradient */}
            <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={c.primary} />
                    <stop offset="100%" stopColor={c.secondary} />
                </linearGradient>
                <linearGradient id="logoGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4a3fbf" />
                    <stop offset="100%" stopColor="#0099cc" />
                </linearGradient>
            </defs>
            
            {/* Outer ring */}
            <circle cx="50" cy="50" r="45" stroke="url(#logoGrad)" strokeWidth="3" fill="none" opacity="0.3" />
            
            {/* Inner shape - Abstract "N" */}
            <path d="M30 70 L30 30 L50 50 L70 30 L70 70 L50 50 L30 70 Z" 
                  fill="url(#logoGrad)" 
                  stroke="url(#logoGrad)" 
                  strokeWidth="2" 
            />
            
            {/* Center dot */}
            <circle cx="50" cy="50" r="5" fill="white" opacity="0.9" />
            
            {/* Decorative dots */}
            <circle cx="30" cy="30" r="3" fill="white" opacity="0.5" />
            <circle cx="70" cy="70" r="3" fill="white" opacity="0.5" />
            <circle cx="70" cy="30" r="3" fill="white" opacity="0.3" />
            <circle cx="30" cy="70" r="3" fill="white" opacity="0.3" />
            
            {/* Glow effect */}
            <circle cx="50" cy="50" r="25" fill="url(#logoGrad)" opacity="0.1" />
        </svg>
    );
};

export const NexoraLogoFull = ({ className = 'h-12', variant = 'default' }) => {
    const colors = {
        default: { primary: '#6C63FF', secondary: '#00D4FF', text: '#FFFFFF' },
        dark: { primary: '#6C63FF', secondary: '#00D4FF', text: '#FFFFFF' },
        light: { primary: '#6C63FF', secondary: '#00D4FF', text: '#1A1A2E' }
    };

    const c = colors[variant] || colors.default;

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <NexoraLogo className="w-10 h-10" variant={variant} />
            <div>
                <span className="text-xl font-bold" style={{ color: c.text }}>
                    Nexora
                </span>
                <p className="text-xs opacity-60" style={{ color: c.text }}>
                    SECURE · MONITOR · PROTECT
                </p>
            </div>
        </div>
    );
};

// Icon only (for favicon, app icon)
export const NexoraIcon = ({ className = 'w-8 h-8' }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6C63FF" />
                <stop offset="100%" stopColor="#00D4FF" />
            </linearGradient>
        </defs>
        <rect width="100" height="100" rx="20" fill="url(#iconGrad)" />
        <path d="M35 70 L35 30 L50 50 L65 30 L65 70 L50 50 L35 70 Z" fill="white" />
        <circle cx="50" cy="50" r="6" fill="url(#iconGrad)" />
    </svg>
);
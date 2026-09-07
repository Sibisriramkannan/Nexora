module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                nexora: {
                    primary: '#6C63FF',
                    secondary: '#00D4FF',
                    dark: '#0A0A1A',
                }
            },
            backgroundImage: {
                'nexora-gradient': 'linear-gradient(135deg, #6C63FF 0%, #00D4FF 100%)',
                'nexora-dark': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
};
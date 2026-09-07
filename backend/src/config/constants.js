module.exports = {
    // Server
    SERVER: {
        NAME: process.env.SERVER_NAME || 'Nexora',
        PORT: parseInt(process.env.PORT) || 8080,
        ENVIRONMENT: process.env.NODE_ENV || 'development',
        BASE_URL: process.env.BASE_URL || 'http://localhost:8080',
        FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
    },

    // Database
    DATABASE: {
        HOST: process.env.DB_HOST || 'localhost',
        PORT: parseInt(process.env.DB_PORT) || 5432,
        NAME: process.env.DB_NAME || 'nexora',
        USER: process.env.DB_USER || 'postgres',
        PASSWORD: process.env.DB_PASSWORD || 'password',
        MAX_CONNECTIONS: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
        IDLE_TIMEOUT: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
        CONNECTION_TIMEOUT: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000
    },

    // Redis
    REDIS: {
        HOST: process.env.REDIS_HOST || 'localhost',
        PORT: parseInt(process.env.REDIS_PORT) || 6379,
        PASSWORD: process.env.REDIS_PASSWORD || '',
        DB: parseInt(process.env.REDIS_DB) || 0,
        KEY_PREFIX: 'nexora:'
    },

    // JWT
    JWT: {
        SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        EXPIRE: process.env.JWT_EXPIRE || '7d',
        REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '30d',
        ALGORITHM: 'HS256'
    },

    // Security
    SECURITY: {
        SALT_ROUNDS: 10,
        API_KEY_LENGTH: 32,
        MFA_ENABLED: process.env.MFA_ENABLED === 'true',
        SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT) || 86400,
        MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
        LOCKOUT_DURATION: parseInt(process.env.LOCKOUT_DURATION) || 900
    },

    // Monitoring
    MONITORING: {
        DEFAULT_INTERVAL: parseInt(process.env.MONITOR_INTERVAL) || 60,
        DEFAULT_TIMEOUT: parseInt(process.env.MONITOR_TIMEOUT) || 10,
        DEFAULT_RETRIES: parseInt(process.env.MONITOR_RETRIES) || 3,
        MAX_CONCURRENT_CHECKS: parseInt(process.env.MAX_CONCURRENT_CHECKS) || 100,
        SSL_WARN_DAYS: parseInt(process.env.SSL_WARN_DAYS) || 7,
        SSL_CRITICAL_DAYS: parseInt(process.env.SSL_CRITICAL_DAYS) || 3
    },

    // Alerting
    ALERTING: {
        DEDUPLICATE: process.env.ALERT_DEDUPLICATE === 'true',
        DEDUP_WINDOW: parseInt(process.env.ALERT_DEDUP_WINDOW) || 3600,
        FLAPPING_THRESHOLD: parseInt(process.env.ALERT_FLAPPING_THRESHOLD) || 3,
        FLAPPING_WINDOW: parseInt(process.env.ALERT_FLAPPING_WINDOW) || 300,
        RECOVERY_CONFIRMS: parseInt(process.env.ALERT_RECOVERY_CONFIRMS) || 3,
        MAX_ALERTS_PER_HOUR: parseInt(process.env.MAX_ALERTS_PER_HOUR) || 100
    },

    // Scanner
    SCANNER: {
        NETWORK_PORTS: process.env.SCANNER_PORTS || '1-10000',
        TIMEOUT: parseInt(process.env.SCANNER_TIMEOUT) || 3600,
        CONCURRENCY: parseInt(process.env.SCANNER_CONCURRENCY) || 10,
        CVE_DB_URL: process.env.CVE_DB_URL || 'https://nvd.nist.gov/feeds/json/cve/1.1/'
    },

    // Email
    EMAIL: {
        HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
        PORT: parseInt(process.env.EMAIL_PORT) || 587,
        USER: process.env.EMAIL_USER || '',
        PASS: process.env.EMAIL_PASS || '',
        FROM: process.env.EMAIL_FROM || 'Nexora <alerts@nexora.com>',
        USE_TLS: process.env.EMAIL_USE_TLS !== 'false',
        USE_STARTTLS: process.env.EMAIL_USE_STARTTLS !== 'false'
    },

    // Slack
    SLACK: {
        WEBHOOK_URL: process.env.SLACK_WEBHOOK || '',
        CHANNEL: process.env.SLACK_CHANNEL || '#alerts'
    },

    // Logging
    LOGGING: {
        LEVEL: process.env.LOG_LEVEL || 'info',
        FORMAT: process.env.LOG_FORMAT || 'json',
        FILE_PATH: process.env.LOG_FILE_PATH || './logs/app.log',
        MAX_SIZE: process.env.LOG_MAX_SIZE || '100MB',
        MAX_FILES: parseInt(process.env.LOG_MAX_FILES) || 30
    },

    // Rate Limiting
    RATE_LIMIT: {
        ENABLED: process.env.RATE_LIMIT_ENABLED !== 'false',
        WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000,
        MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
        BURST: parseInt(process.env.RATE_LIMIT_BURST) || 20
    },

    // CORS
    CORS: {
        ORIGIN: process.env.CORS_ORIGIN || '*',
        METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
        CREDENTIALS: true
    },

    // Agent
    AGENT: {
        HEARTBEAT_INTERVAL: parseInt(process.env.AGENT_HEARTBEAT_INTERVAL) || 30000,
        TIMEOUT_THRESHOLD: parseInt(process.env.AGENT_TIMEOUT_THRESHOLD) || 90000,
        GRPC_PORT: parseInt(process.env.AGENT_GRPC_PORT) || 50051
    }
};
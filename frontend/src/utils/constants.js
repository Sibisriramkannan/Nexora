export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        ME: '/auth/me'
    },
    SERVERS: {
        LIST: '/servers',
        CREATE: '/servers',
        UPDATE: (id) => `/servers/${id}`,
        DELETE: (id) => `/servers/${id}`,
        DETAILS: (id) => `/servers/${id}`
    },
    MONITORS: {
        LIST: '/monitors',
        CREATE: '/monitors',
        UPDATE: (id) => `/monitors/${id}`,
        DELETE: (id) => `/monitors/${id}`,
        TEST: (id) => `/monitors/${id}/test`
    },
    SCANNER: {
        LIST: '/scanner',
        CREATE: '/scanner',
        START: (id) => `/scanner/${id}/start`,
        RESULTS: (id) => `/scanner/${id}/results`
    },
    ALERTS: {
        LIST: '/alerts',
        STATS: '/alerts/stats',
        ACKNOWLEDGE: (id) => `/alerts/${id}/acknowledge`,
        RESOLVE: (id) => `/alerts/${id}/resolve`
    },
    INTEGRATIONS: {
        LIST: '/integrations',
        CREATE: '/integrations',
        UPDATE: (id) => `/integrations/${id}`,
        DELETE: (id) => `/integrations/${id}`,
        TEST: (id) => `/integrations/${id}/test`
    },
    CONFIG: {
        GET: '/config',
        UPDATE: '/config'
    },
    REPORTS: {
        LIST: '/reports',
        GENERATE: '/reports/generate',
        DOWNLOAD: (id) => `/reports/${id}/download`
    },
    DASHBOARD: {
        STATS: '/dashboard/stats',
        UPTIME: '/dashboard/uptime'
    }
};

export const ALERT_SEVERITY = {
    CRITICAL: 'critical',
    HIGH: 'high',
    WARNING: 'warning',
    INFO: 'info'
};

export const ALERT_STATUS = {
    TRIGGERED: 'triggered',
    ACKNOWLEDGED: 'acknowledged',
    RESOLVED: 'resolved',
    MUTED: 'muted'
};

export const SERVER_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    WARNING: 'warning',
    UNKNOWN: 'unknown'
};

export const MONITOR_TYPES = {
    HTTP: 'http',
    HTTPS: 'https',
    PING: 'ping',
    TCP: 'tcp',
    DNS: 'dns'
};
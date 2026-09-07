const crypto = require('crypto');

// Generate random ID
const generateId = (length = 8) => {
    return crypto.randomBytes(length).toString('hex');
};

// Generate API Key
const generateApiKey = () => {
    return `nexora_${crypto.randomBytes(32).toString('hex')}`;
};

// Validate IP address
const isValidIP = (ip) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// Parse duration string to seconds
const parseDuration = (duration) => {
    const units = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400,
        w: 604800
    };
    
    const match = duration.match(/^(\d+)([smhdw])$/);
    if (!match) return null;
    
    const [, value, unit] = match;
    return parseInt(value) * units[unit];
};

// Format bytes to human readable
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Format time duration
const formatDuration = (seconds) => {
    const intervals = [
        { label: 'y', value: 31536000 },
        { label: 'd', value: 86400 },
        { label: 'h', value: 3600 },
        { label: 'm', value: 60 },
        { label: 's', value: 1 }
    ];
    
    let remaining = seconds;
    const parts = [];
    
    for (const interval of intervals) {
        if (remaining >= interval.value) {
            const count = Math.floor(remaining / interval.value);
            parts.push(`${count}${interval.label}`);
            remaining -= count * interval.value;
        }
    }
    
    return parts.join(' ') || '0s';
};

// Mask sensitive data
const maskSensitive = (data) => {
    if (typeof data !== 'object' || data === null) return data;
    
    const masked = { ...data };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'api_key'];
    
    for (const field of sensitiveFields) {
        if (masked[field]) {
            masked[field] = '***MASKED***';
        }
    }
    
    return masked;
};

// Sleep function
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry function
const retry = async (fn, retries = 3, delay = 1000) => {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < retries - 1) {
                await sleep(delay * Math.pow(2, i));
            }
        }
    }
    throw lastError;
};

module.exports = {
    generateId,
    generateApiKey,
    isValidIP,
    parseDuration,
    formatBytes,
    formatDuration,
    maskSensitive,
    sleep,
    retry
};
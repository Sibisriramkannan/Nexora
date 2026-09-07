const { body, param, query, validationResult } = require('express-validator');

// ==================== AUTH VALIDATION ====================
exports.validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    
    body('email')
        .trim()
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number')
];

exports.validateLogin = [
    body('email')
        .trim()
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
];

// ==================== SERVER VALIDATION ====================
exports.validateServer = [
    body('name')
        .trim()
        .notEmpty().withMessage('Server name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Server name must be between 2 and 100 characters'),
    
    body('ip_address')
        .trim()
        .notEmpty().withMessage('IP address is required')
        .isIP().withMessage('Valid IP address is required'),
    
    body('port')
        .optional()
        .isInt({ min: 1, max: 65535 }).withMessage('Port must be between 1 and 65535'),
    
    body('os')
        .optional()
        .isIn(['Linux', 'Windows', 'macOS', 'Unknown']).withMessage('Invalid OS'),
    
    body('environment')
        .optional()
        .isIn(['production', 'staging', 'development']).withMessage('Invalid environment')
];

// ==================== MONITOR VALIDATION ====================
exports.validateMonitor = [
    body('name')
        .trim()
        .notEmpty().withMessage('Monitor name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    body('type')
        .isIn(['http', 'https', 'ping', 'tcp', 'dns']).withMessage('Invalid monitor type'),
    
    body('target')
        .trim()
        .notEmpty().withMessage('Target is required'),
    
    body('interval')
        .optional()
        .isInt({ min: 10, max: 3600 }).withMessage('Interval must be between 10 and 3600 seconds'),
    
    body('timeout')
        .optional()
        .isInt({ min: 1, max: 60 }).withMessage('Timeout must be between 1 and 60 seconds')
];

// ==================== SCAN VALIDATION ====================
exports.validateScan = [
    body('name')
        .trim()
        .notEmpty().withMessage('Scan name is required'),
    
    body('type')
        .isIn(['network', 'web', 'compliance', 'full']).withMessage('Invalid scan type'),
    
    body('targets')
        .isArray().withMessage('Targets must be an array')
        .notEmpty().withMessage('At least one target is required')
];

// ==================== INTEGRATION VALIDATION ====================
exports.validateIntegration = [
    body('name')
        .trim()
        .notEmpty().withMessage('Integration name is required'),
    
    body('type')
        .isIn(['slack', 'email', 'telegram', 'pagerduty', 'jira', 'webhook', 'discord'])
        .withMessage('Invalid integration type'),
    
    body('config')
        .isObject().withMessage('Config must be an object')
];

// ==================== VALIDATION RESULT HANDLER ====================
exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};

// ==================== PARAM VALIDATION ====================
exports.validateId = [
    param('id')
        .isUUID().withMessage('Invalid ID format')
];

exports.validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];
const logger = require('../../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        user: req.user?.id
    });

    // Determine status code
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Send response
    res.status(status).json({
        success: false,
        error: {
            message: message,
            status: status,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

// Custom error classes
class AppError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation error') {
        super(message, 400);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

module.exports = {
    errorHandler,
    AppError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError
};
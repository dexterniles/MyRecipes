/**
 * Application Constants
 * Centralized configuration values and magic numbers
 */

module.exports = {
    // Database
    DATABASE: {
        DEFAULT_POOL_SIZE: 10,
        MAX_POOL_SIZE: 20,
        CONNECTION_TIMEOUT: 5000
    },

    // Authentication
    AUTH: {
        TOKEN_EXPIRY: '7d',
        PASSWORD_MIN_LENGTH: 8,
        PASSWORD_MAX_LENGTH: 128,
        SALT_ROUNDS: 12
    },

    // Rate Limiting
    RATE_LIMIT: {
        API_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        API_MAX_REQUESTS: 100,
        LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        LOGIN_MAX_ATTEMPTS: 5,
        REGISTER_WINDOW_MS: 60 * 60 * 1000, // 1 hour
        REGISTER_MAX_ATTEMPTS: 10
    },

    // Timeouts
    TIMEOUT: {
        REQUEST_TIMEOUT: 30000, // 30 seconds
        RETRY_DELAY: 1000, // 1 second
        MAX_RETRIES: 3
    },

    // File Upload
    UPLOAD: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    },

    // Validation
    VALIDATION: {
        MAX_RECIPE_NAME_LENGTH: 200,
        MAX_DESCRIPTION_LENGTH: 1000,
        MAX_CATEGORY_LENGTH: 50,
        MAX_PREP_TIME: 1440, // 24 hours in minutes
        MAX_COOK_TIME: 1440, // 24 hours in minutes
        MAX_SERVINGS: 100,
        MAX_URL_LENGTH: 500
    },

    // Recipe
    RECIPE: {
        ITEMS_PER_PAGE: 20,
        DEFAULT_SORT: 'created_at',
        DEFAULT_ORDER: 'DESC'
    },

    // Cache
    CACHE: {
        RECIPE_LIST_TTL: 5 * 60, // 5 minutes
        RECIPE_TTL: 10 * 60, // 10 minutes
        USER_TTL: 15 * 60 // 15 minutes
    },

    // Error Messages
    ERROR_MESSAGES: {
        // Network
        NETWORK_ERROR: 'Network error. Please check your connection and try again.',
        TIMEOUT_ERROR: 'Request timed out. Please try again.',
        
        // Rate Limiting
        RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
        LOGIN_RATE_LIMIT: 'Too many login attempts. Please try again in 15 minutes.',
        REGISTER_RATE_LIMIT: 'Too many registration attempts. Please try again in an hour.',
        
        // Authentication
        INVALID_CREDENTIALS: 'Invalid email or password.',
        AUTH_REQUIRED: 'Authentication required. Please log in.',
        INVALID_TOKEN: 'Invalid or expired token. Please log in again.',
        
        // Server
        INTERNAL_SERVER_ERROR: 'Server error. Please try again later.',
        SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
        
        // Not Found
        NOT_FOUND: 'Resource not found.',
        RECIPE_NOT_FOUND: 'Recipe not found.',
        USER_NOT_FOUND: 'User not found.',
        
        // Validation
        VALIDATION_ERROR: 'Invalid data. Please check your input.',
        REQUIRED_FIELD: 'This field is required.',
        INVALID_EMAIL: 'Please provide a valid email address.',
        WEAK_PASSWORD: 'Password must be at least 8 characters long and contain uppercase, lowercase, and a number.',
        
        // General
        OPERATION_FAILED: 'Operation failed. Please try again.',
        UNAUTHORIZED: 'You do not have permission to perform this action.'
    },

    // Success Messages
    SUCCESS_MESSAGES: {
        LOGIN_SUCCESS: 'Login successful!',
        REGISTER_SUCCESS: 'Registration successful!',
        LOGOUT_SUCCESS: 'Logged out successfully',
        RECIPE_CREATED: 'Recipe created successfully',
        RECIPE_UPDATED: 'Recipe updated successfully',
        RECIPE_DELETED: 'Recipe deleted successfully'
    },

    // HTTP Status Codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        TOO_MANY_REQUESTS: 429,
        INTERNAL_SERVER_ERROR: 500,
        SERVICE_UNAVAILABLE: 503
    },

    // Environments
    ENV: {
        DEVELOPMENT: 'development',
        PRODUCTION: 'production',
        TEST: 'test'
    },

    // Pagination
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    },

    // Security Headers
    SECURITY: {
        HSTS_MAX_AGE: 31536000, // 1 year
        X_FRAME_OPTIONS: 'DENY',
        X_CONTENT_TYPE_OPTIONS: 'nosniff'
    }
};

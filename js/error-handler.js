/**
 * Error Handling Utility
 * Provides centralized error handling and user-friendly error messages
 */

class ErrorHandler {
    /**
     * Handle errors gracefully
     * @param {Error} error - The error object
     * @param {string} context - Context where error occurred
     * @returns {string} - User-friendly error message
     */
    static handle(error, context = 'Operation') {
        console.error(`❌ Error in ${context}:`, error);
        
        // Network errors
        if (error.message && error.message.includes('fetch')) {
            return 'Network error. Please check your connection and try again.';
        }
        
        // Timeout errors
        if (error.message && error.message.includes('timeout')) {
            return 'Request timed out. Please try again.';
        }
        
        // Rate limit errors
        if (error.status === 429 || error.message && error.message.includes('rate limit')) {
            return 'Too many requests. Please wait a moment and try again.';
        }
        
        // Authentication errors
        if (error.status === 401 || error.status === 403) {
            return 'Authentication failed. Please log in again.';
        }
        
        // Server errors
        if (error.status >= 500) {
            return 'Server error. Please try again later.';
        }
        
        // Not found errors
        if (error.status === 404) {
            return 'Resource not found.';
        }
        
        // Validation errors
        if (error.status === 400) {
            return error.message || 'Invalid data. Please check your input.';
        }
        
        // Default error message
        return error.message || `${context} failed. Please try again.`;
    }
    
    /**
     * Show error toast notification
     * @param {Error} error - The error object
     * @param {string} context - Context where error occurred
     */
    static showError(error, context = 'Operation') {
        const message = this.handle(error, context);
        
        // Show toast if available
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast(message, 'error');
        } else {
            // Fallback to console and alert
            console.error(message);
            alert(message);
        }
    }
    
    /**
     * Wrap async functions with error handling
     * @param {Function} fn - Async function to wrap
     * @param {string} context - Context for error messages
     * @returns {Function} - Wrapped function
     */
    static wrapAsync(fn, context = 'Operation') {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.showError(error, context);
                throw error;
            }
        };
    }
    
    /**
     * Retry logic for failed operations
     * @param {Function} fn - Function to retry
     * @param {number} maxRetries - Maximum number of retries
     * @param {number} delay - Delay between retries in ms
     * @returns {Promise} - Result of the function
     */
    static async retry(fn, maxRetries = 3, delay = 1000) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                // Don't retry on certain errors
                if (error.status === 400 || error.status === 401 || error.status === 403) {
                    throw error;
                }
                
                // Wait before retrying
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    console.log(`Retrying... (${i + 1}/${maxRetries - 1})`);
                }
            }
        }
        
        throw lastError;
    }
    
    /**
     * Handle network errors specifically
     * @param {Error} error - Network error
     * @returns {boolean} - True if it's a network error
     */
    static isNetworkError(error) {
        return !error.status || error.message.includes('fetch') || error.message.includes('network');
    }
    
    /**
     * Check if error is recoverable
     * @param {Error} error - Error to check
     * @returns {boolean} - True if error is recoverable
     */
    static isRecoverable(error) {
        // Network errors, timeouts, and server errors are recoverable
        return this.isNetworkError(error) || 
               error.status >= 500 || 
               error.status === 429 ||
               error.status === 408;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
}

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}

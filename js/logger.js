/**
 * Logging Utility
 * Centralized logging with environment-based behavior
 */

class Logger {
    constructor() {
        // Check if we're in development mode
        this.isDevelopment = this.getEnvironment() === 'development';
    }
    
    getEnvironment() {
        // Check URL for localhost or development indicators
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const protocol = window.location.protocol;
            
            if (hostname === 'localhost' || 
                hostname === '127.0.0.1' || 
                protocol === 'file:' ||
                hostname.startsWith('192.168.') ||
                hostname.startsWith('10.0.')) {
                return 'development';
            }
        }
        
        // Check for development query parameter
        if (typeof window !== 'undefined' && window.location.search.includes('dev=true')) {
            return 'development';
        }
        
        return 'production';
    }
    
    shouldLog() {
        return this.isDevelopment;
    }
    
    log(message, ...args) {
        if (this.shouldLog()) {
            console.log(`[INFO] ${message}`, ...args);
        }
    }
    
    error(message, ...args) {
        // Always log errors
        console.error(`[ERROR] ${message}`, ...args);
    }
    
    warn(message, ...args) {
        if (this.shouldLog()) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    }
    
    debug(message, ...args) {
        if (this.shouldLog()) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
    
    info(message, ...args) {
        if (this.shouldLog()) {
            console.info(`[INFO] ${message}`, ...args);
        }
    }
    
    table(data) {
        if (this.shouldLog()) {
            console.table(data);
        }
    }
    
    group(label) {
        if (this.shouldLog()) {
            console.group(label);
        }
    }
    
    groupEnd() {
        if (this.shouldLog()) {
            console.groupEnd();
        }
    }
}

// Create singleton instance
const logger = new Logger();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.logger = logger;
}

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = logger;
}

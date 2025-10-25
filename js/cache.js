/**
 * API Response Cache
 * Provides caching for API responses with TTL
 */

class ResponseCache {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Generate cache key
     * @param {string} url - Request URL
     * @param {Object} params - Request parameters
     * @returns {string} - Cache key
     */
    generateKey(url, params = {}) {
        const paramString = JSON.stringify(params);
        return `${url}:${paramString}`;
    }

    /**
     * Get cached response
     * @param {string} key - Cache key
     * @returns {Object|null} - Cached response or null
     */
    get(key) {
        const cached = this.cache.get(key);
        
        if (!cached) {
            return null;
        }

        // Check if expired
        if (Date.now() > cached.expires) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Set cached response
     * @param {string} key - Cache key
     * @param {Object} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    set(key, data, ttl = null) {
        const expires = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, { data, expires });
    }

    /**
     * Clear cached response
     * @param {string} key - Cache key or pattern
     */
    clear(key) {
        if (key) {
            // Clear specific key or pattern
            if (key.includes('*')) {
                const pattern = key.replace(/\*/g, '.*');
                const regex = new RegExp(pattern);
                
                for (const k of this.cache.keys()) {
                    if (regex.test(k)) {
                        this.cache.delete(k);
                    }
                }
            } else {
                this.cache.delete(key);
            }
        } else {
            // Clear all
            this.cache.clear();
        }
    }

    /**
     * Clear expired entries
     */
    clearExpired() {
        const now = Date.now();
        
        for (const [key, value] of this.cache.entries()) {
            if (now > value.expires) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache size
     * @returns {number} - Number of cached items
     */
    size() {
        return this.cache.size;
    }

    /**
     * Check if key exists in cache
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        const cached = this.cache.get(key);
        
        if (!cached) {
            return false;
        }

        // Check if expired
        if (Date.now() > cached.expires) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Auto-clean expired entries every minute
     */
    startAutoClean() {
        if (this.cleanInterval) {
            return; // Already started
        }

        this.cleanInterval = setInterval(() => {
            this.clearExpired();
        }, 60 * 1000); // Every minute
    }

    /**
     * Stop auto-clean
     */
    stopAutoClean() {
        if (this.cleanInterval) {
            clearInterval(this.cleanInterval);
            this.cleanInterval = null;
        }
    }
}

// Create singleton instance
const responseCache = new ResponseCache();
responseCache.startAutoClean(); // Start auto-cleaning

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.responseCache = responseCache;
}

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = responseCache;
}

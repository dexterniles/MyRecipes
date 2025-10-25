/**
 * Input Sanitization Utility
 * Protects against XSS attacks by sanitizing user input
 */

class Sanitizer {
    /**
     * Sanitize HTML content
     * @param {string} dirty - Unsanitized HTML string
     * @returns {string} - Sanitized HTML string
     */
    static sanitizeHTML(dirty) {
        if (!dirty) return '';
        
        // Simple HTML entity encoding (basic XSS protection)
        const entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };
        
        return String(dirty).replace(/[&<>"'\/]/g, (char) => entityMap[char]);
    }

    /**
     * Sanitize text content
     * @param {string} text - Text to sanitize
     * @returns {string} - Sanitized text
     */
    static sanitizeText(text) {
        if (!text) return '';
        return this.sanitizeHTML(text);
    }

    /**
     * Sanitize array of strings
     * @param {string[]} items - Array of strings to sanitize
     * @returns {string[]} - Array of sanitized strings
     */
    static sanitizeArray(items) {
        if (!Array.isArray(items)) return [];
        return items.map(item => this.sanitizeText(item));
    }

    /**
     * Validate and sanitize email
     * @param {string} email - Email to validate
     * @returns {string} - Validated and sanitized email
     */
    static sanitizeEmail(email) {
        if (!email) return '';
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn('Invalid email format:', email);
            return '';
        }
        return email.toLowerCase().trim();
    }

    /**
     * Validate and sanitize URL
     * @param {string} url - URL to validate
     * @returns {string} - Validated URL or empty string
     */
    static sanitizeURL(url) {
        if (!url) return '';
        try {
            // Validate URL format
            new URL(url);
            // Only allow http and https protocols
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                console.warn('URL must use http:// or https://');
                return '';
            }
            return url;
        } catch (error) {
            console.warn('Invalid URL:', url);
            return '';
        }
    }

    /**
     * Sanitize recipe data before sending to API
     * @param {Object} recipe - Recipe object to sanitize
     * @returns {Object} - Sanitized recipe object
     */
    static sanitizeRecipe(recipe) {
        return {
            name: this.sanitizeText(recipe.name),
            description: this.sanitizeText(recipe.description),
            category: this.sanitizeText(recipe.category),
            prep_time: recipe.prep_time,
            cook_time: recipe.cook_time,
            servings: recipe.servings,
            difficulty: this.sanitizeText(recipe.difficulty),
            equipment: this.sanitizeText(recipe.equipment),
            allergens: this.sanitizeArray(recipe.allergens || []),
            dietary: this.sanitizeArray(recipe.dietary || []),
            ingredients: this.sanitizeArray(recipe.ingredients || []),
            instructions: this.sanitizeArray(recipe.instructions || []),
            notes: this.sanitizeText(recipe.notes),
            image_url: this.sanitizeURL(recipe.image_url)
        };
    }

    /**
     * Sanitize user input (registration/login)
     * @param {Object} userData - User data to sanitize
     * @returns {Object} - Sanitized user data
     */
    static sanitizeUserInput(userData) {
        const sanitized = {
            username: this.sanitizeText(userData.username),
            email: this.sanitizeEmail(userData.email),
            password: userData.password // Don't sanitize passwords
        };
        return sanitized;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Sanitizer = Sanitizer;
}

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sanitizer;
}

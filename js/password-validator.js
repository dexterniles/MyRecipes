/**
 * Password Validation Utility
 * Provides client-side password strength validation
 */

class PasswordValidator {
    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} - Validation result with isValid and messages
     */
    static validate(password) {
        const errors = [];
        const warnings = [];
        
        if (!password) {
            return {
                isValid: false,
                messages: ['Password is required'],
                strength: 'weak'
            };
        }
        
        // Check minimum length
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        
        // Check for uppercase letter
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        // Check for lowercase letter
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        // Check for number
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        // Warnings for better password strength
        if (password.length < 12) {
            warnings.push('Consider using a password longer than 12 characters');
        }
        
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            warnings.push('Consider adding a special character for better security');
        }
        
        // Calculate strength
        let strength = 'weak';
        if (errors.length === 0) {
            if (password.length >= 12 && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                strength = 'strong';
            } else {
                strength = 'medium';
            }
        }
        
        return {
            isValid: errors.length === 0,
            messages: [...errors, ...warnings],
            strength
        };
    }
    
    /**
     * Get password strength indicator
     * @param {string} password - Password to check
     * @returns {string} - 'weak', 'medium', or 'strong'
     */
    static getStrength(password) {
        const validation = this.validate(password);
        return validation.strength;
    }
    
    /**
     * Get visual strength indicator (for UI)
     * @param {string} password - Password to check
     * @returns {Object} - {strength, color, width}
     */
    static getStrengthIndicator(password) {
        const strength = this.getStrength(password);
        
        const indicators = {
            weak: {
                strength: 'weak',
                color: '#dc2626',
                width: '33%',
                text: 'Weak'
            },
            medium: {
                strength: 'medium',
                color: '#f59e0b',
                width: '66%',
                text: 'Medium'
            },
            strong: {
                strength: 'strong',
                color: '#10b981',
                width: '100%',
                text: 'Strong'
            }
        };
        
        return indicators[strength] || indicators.weak;
    }
    
    /**
     * Check if password meets minimum requirements
     * @param {string} password - Password to check
     * @returns {boolean}
     */
    static meetsMinimum(password) {
        const validation = this.validate(password);
        return validation.isValid;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PasswordValidator = PasswordValidator;
}

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PasswordValidator;
}

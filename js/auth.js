// Authentication Component
class AuthManager {
    constructor() {
        this.api = new ApiService();
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Register form
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());
        
        // Toggle between login and register
        document.getElementById('showRegister')?.addEventListener('click', () => this.showRegister());
        document.getElementById('showLogin')?.addEventListener('click', () => this.showLogin());
    }

    async checkAuthStatus() {
        if (this.api.isAuthenticated()) {
            try {
                const response = await this.api.getCurrentUser();
                this.currentUser = response.user;
                this.showAuthenticatedState();
            } catch (error) {
                console.error('Auth check failed:', error);
                this.api.logout();
                this.showLoginForm();
            }
        } else {
            this.showLoginForm();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            const response = await this.api.login(username, password);
            this.currentUser = response.user;
            this.showAuthenticatedState();
            this.showNotification('Login successful!', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        try {
            const response = await this.api.register(username, email, password);
            this.currentUser = response.user;
            this.showAuthenticatedState();
            this.showNotification('Registration successful!', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async handleLogout() {
        this.api.logout();
        this.currentUser = null;
        this.showLoginForm();
        this.showNotification('Logged out successfully', 'info');
    }

    showLoginForm() {
        document.getElementById('authView').style.display = 'block';
        document.getElementById('appView').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    }

    showRegister() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }

    showLogin() {
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    }

    showAuthenticatedState() {
        document.getElementById('authView').style.display = 'none';
        document.getElementById('appView').style.display = 'block';
        
        // Update user info in header
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.textContent = `Welcome, ${this.currentUser.username}`;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.api.isAuthenticated();
    }
}

// Export for use in other files
window.AuthManager = AuthManager;

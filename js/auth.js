class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        // Check if user is already logged in
        const token = localStorage.getItem('prepsync_token');
        if (token) {
            try {
                const response = await apiService.getCurrentUser();
                if (response.success) {
                    this.currentUser = response.data.user;
                    this.isAuthenticated = true;
                    this.updateAuthUI();
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                this.logout();
            }
        }
    }

    async login(email, password) {
        try {
            const response = await apiService.login({ email, password });
            if (response.success) {
                this.currentUser = response.data.user;
                this.isAuthenticated = true;
                this.updateAuthUI();
                return { success: true, user: this.currentUser };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async register(username, email, password) {
        try {
            const response = await apiService.register({ username, email, password });
            if (response.success) {
                this.currentUser = response.data.user;
                this.isAuthenticated = true;
                this.updateAuthUI();
                return { success: true, user: this.currentUser };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async logout() {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            this.currentUser = null;
            this.isAuthenticated = false;
            this.updateAuthUI();
        }
    }

    updateAuthUI() {
        const userInfo = document.getElementById('userInfo');
        const authButtons = document.getElementById('authButtons');
        const userName = document.getElementById('userName');

        if (this.isAuthenticated && this.currentUser) {
            // Show user info, hide auth buttons
            userInfo.style.display = 'flex';
            authButtons.style.display = 'none';
            userName.textContent = this.currentUser.username;
        } else {
            // Hide user info, show auth buttons
            userInfo.style.display = 'none';
            authButtons.style.display = 'flex';
        }
    }

    getUserName() {
        return this.currentUser ? this.currentUser.username : null;
    }

    getUserId() {
        return this.currentUser ? this.currentUser.id : null;
    }
}

// Create global instance
window.authManager = new AuthManager();
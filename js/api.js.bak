// API Service for Recipe Management
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    // Get authorization headers
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    // Make authenticated API request
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async register(username, email, password) {
        const response = await fetch(`${this.baseURL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        this.setToken(data.token);
        return data;
    }

    async login(username, password) {
        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        this.setToken(data.token);
        return data;
    }

    async logout() {
        this.clearToken();
    }

    async getCurrentUser() {
        if (!this.token) {
            throw new Error('No authentication token');
        }
        return await this.makeRequest('/auth/me');
    }

    // Recipe methods
    async getRecipes() {
        return await this.makeRequest('/recipes');
    }

    async getRecipe(id) {
        return await this.makeRequest(`/recipes/${id}`);
    }

    async createRecipe(recipeData) {
        return await this.makeRequest('/recipes', {
            method: 'POST',
            body: JSON.stringify(recipeData)
        });
    }

    async updateRecipe(id, recipeData) {
        return await this.makeRequest(`/recipes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(recipeData)
        });
    }

    async deleteRecipe(id) {
        return await this.makeRequest(`/recipes/${id}`, {
            method: 'DELETE'
        });
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }
}

// Export for use in other files
window.ApiService = ApiService;

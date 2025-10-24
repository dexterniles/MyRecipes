class ApiService {
    constructor() {
        this.baseURL = window.location.origin + '/api';
        this.token = localStorage.getItem('prepsync_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('prepsync_token', token);
        } else {
            localStorage.removeItem('prepsync_token');
        }
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('prepsync_token');
    }

    // Make authenticated request
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async register(userData) {
        return await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        const response = await this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }
        
        return response;
    }

    async logout() {
        try {
            await this.makeRequest('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            this.clearToken();
        }
    }

    async getCurrentUser() {
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

    async searchRecipes(query) {
        return await this.makeRequest(`/recipes/search/${encodeURIComponent(query)}`);
    }

    // Health check
    async healthCheck() {
        return await this.makeRequest('/health');
    }
}

// Create global instance
window.apiService = new ApiService();
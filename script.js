class PrepSyncApp {
    constructor() {
        this.currentView = 'recipeList';
        this.currentRecipe = null;
        this.recipes = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.showView('recipeList');
        
        // Load recipes if user is authenticated
        if (authManager.isAuthenticated) {
            await this.loadRecipes();
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('addRecipeBtn').addEventListener('click', () => {
            this.showView('addRecipe');
        });

        // Top cancel buttons removed - only using bottom cancel buttons now

        // Bottom cancel buttons (next to save buttons)
        const cancelAddBtnBottom = document.getElementById('cancelAddBtnBottom');
        const cancelEditBtnBottom = document.getElementById('cancelEditBtnBottom');
        
        if (cancelAddBtnBottom) {
            console.log('✅ Cancel Add Bottom button found and attached');
            cancelAddBtnBottom.addEventListener('click', () => {
                console.log('🔄 Cancel Add Bottom button clicked');
                // Clear the add recipe form
                document.getElementById('addRecipeForm').reset();
                this.clearDynamicInputs('addIngredientsContainer');
                this.clearDynamicInputs('addInstructionsContainer');
                this.showView('recipeList');
            });
        } else {
            console.error('❌ Cancel Add Bottom button not found');
        }

        if (cancelEditBtnBottom) {
            console.log('✅ Cancel Edit Bottom button found and attached');
            cancelEditBtnBottom.addEventListener('click', () => {
                console.log('🔄 Cancel Edit Bottom button clicked');
                // Clear the edit recipe form
                document.getElementById('editRecipeForm').reset();
                this.clearDynamicInputs('editIngredientsContainer');
                this.clearDynamicInputs('editInstructionsContainer');
                this.showView('recipeList');
            });
        } else {
            console.error('❌ Cancel Edit Bottom button not found');
        }

        // Authentication
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showAuthModal('login');
        });

        document.getElementById('registerBtn').addEventListener('click', () => {
            this.showAuthModal('register');
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Forms
        document.getElementById('addRecipeForm').addEventListener('submit', (e) => {
            this.handleAddRecipe(e);
        });

        document.getElementById('editRecipeForm').addEventListener('submit', (e) => {
            this.handleEditRecipe(e);
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Modal
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('editRecipeBtn').addEventListener('click', () => {
            this.editRecipe(this.currentRecipe);
        });

        document.getElementById('deleteRecipeBtn').addEventListener('click', () => {
            this.deleteRecipe(this.currentRecipe.id);
        });

        // Authentication forms
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            this.handleRegister(e);
        });

        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAuthTab(e.target.dataset.tab);
            });
        });

        // Dynamic ingredient/instruction buttons
        document.getElementById('addIngredientBtn').addEventListener('click', () => {
            this.addIngredientField();
        });

        document.getElementById('addInstructionBtn').addEventListener('click', () => {
            this.addInstructionField();
        });

        document.getElementById('editAddIngredientBtn').addEventListener('click', () => {
            this.addIngredientField('edit');
        });

        document.getElementById('editAddInstructionBtn').addEventListener('click', () => {
            this.addInstructionField('edit');
        });

        // Close modal on outside click
        document.getElementById('recipeModal').addEventListener('click', (e) => {
            if (e.target.id === 'recipeModal') {
                this.closeModal();
            }
        });

        // Close auth modal on outside click
        document.getElementById('authModal').addEventListener('click', (e) => {
            if (e.target.id === 'authModal') {
                this.closeAuthModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeAuthModal();
            }
        });
    }

    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        document.getElementById(viewName + 'View').classList.add('active');
        this.currentView = viewName;

        // Load data if needed
        if (viewName === 'recipeList' && authManager.isAuthenticated) {
            this.loadRecipes();
        }
    }

    async loadRecipes() {
        try {
            this.showLoading(true);
            const response = await apiService.getRecipes();
            if (response.success) {
                this.recipes = response.data.recipes;
                this.renderRecipes();
            }
        } catch (error) {
            this.showToast('Failed to load recipes', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderRecipes() {
        const recipeGrid = document.getElementById('recipeGrid');
        
        if (this.recipes.length === 0) {
            recipeGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <h3>No recipes yet</h3>
                    <p>Start building your recipe collection by adding your first recipe!</p>
                    <button class="btn btn-primary" onclick="app.showView('addRecipe')">
                        <i class="fas fa-plus"></i>
                        Add Recipe
                    </button>
                </div>
            `;
            return;
        }

        recipeGrid.innerHTML = this.recipes.map(recipe => `
            <div class="recipe-card ${this.getDifficultyClass(recipe.difficulty)}" onclick="app.showRecipeModal(${recipe.id})">
                <div class="recipe-card-header">
                    <h3 class="recipe-name">${recipe.name}</h3>
                    <span class="recipe-category">${recipe.category || 'Uncategorized'}</span>
                </div>
                <div class="recipe-meta">
                    ${recipe.prep_time ? `<div class="meta-item"><i class="fas fa-clock"></i><span>${recipe.prep_time} min prep</span></div>` : ''}
                    ${recipe.cook_time ? `<div class="meta-item"><i class="fas fa-fire"></i><span>${recipe.cook_time} min cook</span></div>` : ''}
                    ${recipe.servings ? `<div class="meta-item"><i class="fas fa-users"></i><span>${recipe.servings} servings</span></div>` : ''}
                    ${recipe.difficulty ? `<div class="meta-item"><i class="fas fa-signal"></i><span class="difficulty-${recipe.difficulty.toLowerCase()}">${recipe.difficulty}</span></div>` : ''}
                </div>
                ${recipe.description ? `<div class="recipe-description">${recipe.description}</div>` : ''}
                <div class="recipe-actions">
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); app.showRecipeModal(${recipe.id})">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); app.editRecipe(${recipe.id})">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                </div>
            </div>
        `).join('');
    }

    getDifficultyClass(difficulty) {
        switch (difficulty) {
            case 'Easy': return 'quick-prep';
            case 'Hard': return 'complex-prep';
            default: return '';
        }
    }

    async showRecipeModal(recipeId) {
        try {
            const response = await apiService.getRecipe(recipeId);
            if (response.success) {
                this.currentRecipe = response.data.recipe;
                this.populateRecipeModal();
                document.getElementById('recipeModal').classList.add('active');
            }
        } catch (error) {
            this.showToast('Failed to load recipe', 'error');
        }
    }

    populateRecipeModal() {
        const recipe = this.currentRecipe;
        
        document.getElementById('modalRecipeName').textContent = recipe.name;
        document.getElementById('modalPrepTime').textContent = recipe.prep_time || 'N/A';
        document.getElementById('modalCookTime').textContent = recipe.cook_time || 'N/A';
        document.getElementById('modalServings').textContent = recipe.servings || 'N/A';
        document.getElementById('modalDifficulty').textContent = recipe.difficulty || 'N/A';
        
        document.getElementById('modalDescription').textContent = recipe.description || 'No description available.';
        
        // Ingredients
        const ingredientsList = document.getElementById('modalIngredients');
        ingredientsList.innerHTML = recipe.ingredients.map(ingredient => 
            `<li>${ingredient}</li>`
        ).join('');
        
        // Instructions
        const instructionsList = document.getElementById('modalInstructions');
        instructionsList.innerHTML = recipe.instructions.map(instruction => 
            `<li>${instruction}</li>`
        ).join('');
        
        // Notes
        if (recipe.notes) {
            document.getElementById('modalNotesContainer').style.display = 'block';
            document.getElementById('modalNotes').textContent = recipe.notes;
        } else {
            document.getElementById('modalNotesContainer').style.display = 'none';
        }
    }

    closeModal() {
        document.getElementById('recipeModal').classList.remove('active');
        this.currentRecipe = null;
    }

    clearDynamicInputs(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    }

    async editRecipe(recipeId) {
        try {
            const response = await apiService.getRecipe(recipeId);
            if (response.success) {
                this.currentRecipe = response.data.recipe;
                this.populateEditForm();
                this.showView('editRecipe');
                this.closeModal();
            }
        } catch (error) {
            this.showToast('Failed to load recipe for editing', 'error');
        }
    }

    populateEditForm() {
        const recipe = this.currentRecipe;
        
        document.getElementById('editRecipeId').value = recipe.id;
        document.getElementById('editRecipeName').value = recipe.name;
        document.getElementById('editRecipeCategory').value = recipe.category || '';
        document.getElementById('editPrepTime').value = recipe.prep_time || '';
        document.getElementById('editCookTime').value = recipe.cook_time || '';
        document.getElementById('editServings').value = recipe.servings || '';
        document.getElementById('editDifficulty').value = recipe.difficulty || '';
        document.getElementById('editDescription').value = recipe.description || '';
        document.getElementById('editNotes').value = recipe.notes || '';
        document.getElementById('editImageUrl').value = recipe.image_url || '';
        
        // Populate ingredients
        const ingredientsContainer = document.getElementById('editIngredientsContainer');
        ingredientsContainer.innerHTML = '';
        recipe.ingredients.forEach((ingredient, index) => {
            this.addIngredientField('edit', ingredient);
        });
        
        // Populate instructions
        const instructionsContainer = document.getElementById('editInstructionsContainer');
        instructionsContainer.innerHTML = '';
        recipe.instructions.forEach((instruction, index) => {
            this.addInstructionField('edit', instruction);
        });
    }

    async handleAddRecipe(e) {
        e.preventDefault();
        
        if (!authManager.isAuthenticated) {
            this.showToast('Please log in to add recipes', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            const formData = this.getFormData('addRecipeForm');
            const response = await apiService.createRecipe(formData);
            
            if (response.success) {
                this.showToast('Recipe created successfully!', 'success');
                this.showView('recipeList');
                this.resetForm('addRecipeForm');
                await this.loadRecipes();
            }
        } catch (error) {
            this.showToast('Failed to create recipe: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleEditRecipe(e) {
        e.preventDefault();
        
        try {
            this.showLoading(true);
            const formData = this.getFormData('editRecipeForm');
            const recipeId = document.getElementById('editRecipeId').value;
            const response = await apiService.updateRecipe(recipeId, formData);
            
            if (response.success) {
                this.showToast('Recipe updated successfully!', 'success');
                this.showView('recipeList');
                await this.loadRecipes();
            }
        } catch (error) {
            this.showToast('Failed to update recipe: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    getFormData(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = {};
        
        // Get basic fields
        for (let [key, value] of formData.entries()) {
            if (key === 'prep_time' || key === 'cook_time' || key === 'servings') {
                data[key] = value ? parseInt(value) : null;
            } else {
                data[key] = value;
            }
        }
        
        // Get ingredients
        const ingredients = [];
        const ingredientInputs = form.querySelectorAll('.ingredient-input');
        ingredientInputs.forEach(input => {
            if (input.value.trim()) {
                ingredients.push(input.value.trim());
            }
        });
        data.ingredients = ingredients;
        
        // Get instructions
        const instructions = [];
        const instructionInputs = form.querySelectorAll('.instruction-text');
        instructionInputs.forEach(input => {
            if (input.value.trim()) {
                instructions.push(input.value.trim());
            }
        });
        data.instructions = instructions;
        
        return data;
    }

    resetForm(formId) {
        document.getElementById(formId).reset();
        
        // Reset ingredients
        const ingredientsContainer = formId === 'addRecipeForm' ? 
            document.querySelector('.ingredients-input') : 
            document.getElementById('editIngredientsContainer');
        ingredientsContainer.innerHTML = `
            <div class="ingredient-item">
                <input type="text" class="ingredient-input" placeholder="e.g., 2 cups flour">
                <button type="button" class="btn-remove-ingredient" onclick="removeIngredient(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Reset instructions
        const instructionsContainer = formId === 'addRecipeForm' ? 
            document.querySelector('.instructions-input') : 
            document.getElementById('editInstructionsContainer');
        instructionsContainer.innerHTML = `
            <div class="instruction-item">
                <span class="step-number">1</span>
                <textarea class="instruction-text" placeholder="Describe the cooking step..."></textarea>
                <button type="button" class="btn-remove-instruction" onclick="removeInstruction(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    addIngredientField(type = 'add', value = '') {
        const container = type === 'add' ? 
            document.querySelector('.ingredients-input') : 
            document.getElementById('editIngredientsContainer');
        
        const ingredientItem = document.createElement('div');
        ingredientItem.className = 'ingredient-item';
        ingredientItem.innerHTML = `
            <input type="text" class="ingredient-input" placeholder="e.g., 2 cups flour" value="${value}">
            <button type="button" class="btn-remove-ingredient" onclick="removeIngredient(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(ingredientItem);
    }

    addInstructionField(type = 'add', value = '') {
        const container = type === 'add' ? 
            document.querySelector('.instructions-input') : 
            document.getElementById('editInstructionsContainer');
        
        const instructionItem = document.createElement('div');
        instructionItem.className = 'instruction-item';
        
        const stepNumber = container.children.length + 1;
        instructionItem.innerHTML = `
            <span class="step-number">${stepNumber}</span>
            <textarea class="instruction-text" placeholder="Describe the cooking step...">${value}</textarea>
            <button type="button" class="btn-remove-instruction" onclick="removeInstruction(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(instructionItem);
    }

    async deleteRecipe(recipeId) {
        if (!confirm('Are you sure you want to delete this recipe?')) {
            return;
        }
        
        try {
            this.showLoading(true);
            const response = await apiService.deleteRecipe(recipeId);
            
            if (response.success) {
                this.showToast('Recipe deleted successfully!', 'success');
                this.closeModal();
                await this.loadRecipes();
            }
        } catch (error) {
            this.showToast('Failed to delete recipe: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleSearch(query) {
        if (!query.trim()) {
            this.renderRecipes();
            return;
        }
        
        try {
            const response = await apiService.searchRecipes(query);
            if (response.success) {
                this.recipes = response.data.recipes;
                this.renderRecipes();
            }
        } catch (error) {
            this.showToast('Search failed', 'error');
        }
    }

    showAuthModal(tab = 'login') {
        document.getElementById('authModal').classList.add('active');
        this.switchAuthTab(tab);
    }

    closeAuthModal() {
        document.getElementById('authModal').classList.remove('active');
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}Form`).classList.add('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            this.showLoading(true);
            const result = await authManager.login(email, password);
            
            if (result.success) {
                this.showToast('Login successful!', 'success');
                this.closeAuthModal();
                await this.loadRecipes();
            } else {
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            this.showToast('Login failed: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        try {
            this.showLoading(true);
            const result = await authManager.register(username, email, password);
            
            if (result.success) {
                this.showToast('Registration successful!', 'success');
                this.closeAuthModal();
                await this.loadRecipes();
            } else {
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            this.showToast('Registration failed: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async logout() {
        await authManager.logout();
        this.showToast('Logged out successfully', 'success');
        this.showView('recipeList');
        this.recipes = [];
        this.renderRecipes();
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }

    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Global functions for inline event handlers
function removeIngredient(button) {
    const ingredientItem = button.closest('.ingredient-item');
    if (document.querySelectorAll('.ingredient-item').length > 1) {
        ingredientItem.remove();
    }
}

function removeInstruction(button) {
    const instructionItem = button.closest('.instruction-item');
    if (document.querySelectorAll('.instruction-item').length > 1) {
        instructionItem.remove();
        // Renumber steps
        document.querySelectorAll('.instruction-item .step-number').forEach((span, index) => {
            span.textContent = index + 1;
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PrepSyncApp();
});

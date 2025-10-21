// Recipe Management Application
class RecipeManager {
    constructor() {
        this.recipes = this.loadRecipes();
        this.currentView = 'recipes';
        this.editingRecipeId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderRecipes();
        this.updateYear();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('viewRecipes').addEventListener('click', () => this.showView('recipes'));
        document.getElementById('addRecipe').addEventListener('click', () => this.showView('addRecipe'));
        document.getElementById('cancelBtn').addEventListener('click', () => this.showView('recipes'));

        // Form submission
        document.getElementById('recipeForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', () => this.filterRecipes());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterRecipes());

        // Modal
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('recipeModal').addEventListener('click', (e) => {
            if (e.target.id === 'recipeModal') this.closeModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                if (this.currentView === 'addRecipe') {
                    this.showView('recipes');
                }
            }
        });
    }

    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

        // Show selected view
        if (viewName === 'recipes') {
            document.getElementById('recipesView').classList.add('active');
            document.getElementById('viewRecipes').classList.add('active');
            this.renderRecipes();
        } else if (viewName === 'addRecipe') {
            document.getElementById('addRecipeView').classList.add('active');
            document.getElementById('addRecipe').classList.add('active');
            this.clearForm();
        }
        
        this.currentView = viewName;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const recipe = {
            id: this.editingRecipeId || Date.now().toString(),
            name: document.getElementById('recipeName').value.trim(),
            category: document.getElementById('recipeCategory').value,
            cookingTime: parseInt(document.getElementById('cookingTime').value) || null,
            servings: parseInt(document.getElementById('servings').value) || null,
            ingredients: document.getElementById('ingredients').value.trim(),
            instructions: document.getElementById('instructions').value.trim(),
            notes: document.getElementById('notes').value.trim(),
            dateCreated: this.editingRecipeId ? this.recipes.find(r => r.id === this.editingRecipeId).dateCreated : new Date().toISOString(),
            dateModified: new Date().toISOString()
        };

        // Validation
        if (!recipe.name || !recipe.category || !recipe.ingredients || !recipe.instructions) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (this.editingRecipeId) {
            // Update existing recipe
            const index = this.recipes.findIndex(r => r.id === this.editingRecipeId);
            this.recipes[index] = recipe;
            this.showNotification('Recipe updated successfully!', 'success');
        } else {
            // Add new recipe
            this.recipes.unshift(recipe);
            this.showNotification('Recipe added successfully!', 'success');
        }

        this.saveRecipes();
        this.showView('recipes');
        this.clearForm();
        this.editingRecipeId = null;
    }

    renderRecipes() {
        const recipesGrid = document.getElementById('recipesGrid');
        const noRecipes = document.getElementById('noRecipes');
        
        if (this.recipes.length === 0) {
            recipesGrid.style.display = 'none';
            noRecipes.style.display = 'block';
            return;
        }

        recipesGrid.style.display = 'grid';
        noRecipes.style.display = 'none';
        
        recipesGrid.innerHTML = this.recipes.map(recipe => this.createRecipeCard(recipe)).join('');
    }

    createRecipeCard(recipe) {
        const ingredientsPreview = recipe.ingredients.split('\n').slice(0, 3).join(', ');
        const timeText = recipe.cookingTime ? `${recipe.cookingTime} min` : 'N/A';
        const servingsText = recipe.servings ? `${recipe.servings} servings` : 'N/A';
        
        return `
            <div class="recipe-card" data-type="${recipe.category}" onclick="recipeManager.showRecipeDetail('${recipe.id}')">
                <div class="recipe-header">
                    <div>
                        <h3 class="recipe-title">${this.escapeHtml(recipe.name)}</h3>
                        <span class="recipe-category recipe-type-${recipe.category}">${this.getRecipeTypeIcon(recipe.category)} ${recipe.category}</span>
                    </div>
                </div>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${timeText}</span>
                    <span><i class="fas fa-users"></i> ${servingsText}</span>
                </div>
                <div class="recipe-ingredients">
                    <h4>Ingredients</h4>
                    <p>${this.escapeHtml(ingredientsPreview)}${recipe.ingredients.split('\n').length > 3 ? '...' : ''}</p>
                </div>
                <div class="recipe-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-secondary" onclick="recipeManager.editRecipe('${recipe.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="recipeManager.deleteRecipe('${recipe.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    showRecipeDetail(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = `
            <div class="recipe-detail">
                <h2>${this.escapeHtml(recipe.name)}</h2>
                <div class="recipe-meta">
                    <span class="recipe-category recipe-type-${recipe.category}">${this.getRecipeTypeIcon(recipe.category)} ${recipe.category}</span>
                    ${recipe.cookingTime ? `<span><i class="fas fa-clock"></i> ${recipe.cookingTime} minutes</span>` : ''}
                    ${recipe.servings ? `<span><i class="fas fa-users"></i> ${recipe.servings} servings</span>` : ''}
                </div>
                
                <div class="recipe-section">
                    <h3><i class="fas fa-list"></i> Ingredients</h3>
                    <div class="ingredients-list">
                        ${recipe.ingredients.split('\n').map(ingredient => 
                            `<div class="ingredient-item">${this.escapeHtml(ingredient.trim())}</div>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="recipe-section">
                    <h3><i class="fas fa-list-ol"></i> Instructions</h3>
                    <div class="instructions-list">
                        ${recipe.instructions.split('\n').map((instruction, index) => 
                            `<div class="instruction-item">
                                <span class="step-number">${index + 1}</span>
                                <span class="step-text">${this.escapeHtml(instruction.trim())}</span>
                            </div>`
                        ).join('')}
                    </div>
                </div>
                
                ${recipe.notes ? `
                <div class="recipe-section">
                    <h3><i class="fas fa-sticky-note"></i> Notes</h3>
                    <p>${this.escapeHtml(recipe.notes)}</p>
                </div>
                ` : ''}
                
                <div class="recipe-actions">
                    <button class="btn btn-primary" onclick="recipeManager.editRecipe('${recipe.id}'); recipeManager.closeModal();">
                        <i class="fas fa-edit"></i> Edit Recipe
                    </button>
                    <button class="btn btn-danger" onclick="recipeManager.deleteRecipe('${recipe.id}'); recipeManager.closeModal();">
                        <i class="fas fa-trash"></i> Delete Recipe
                    </button>
                </div>
            </div>
        `;

        document.getElementById('recipeModal').style.display = 'block';
    }

    editRecipe(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        this.editingRecipeId = recipeId;
        
        // Populate form
        document.getElementById('recipeName').value = recipe.name;
        document.getElementById('recipeCategory').value = recipe.category;
        document.getElementById('cookingTime').value = recipe.cookingTime || '';
        document.getElementById('servings').value = recipe.servings || '';
        document.getElementById('ingredients').value = recipe.ingredients;
        document.getElementById('instructions').value = recipe.instructions;
        document.getElementById('notes').value = recipe.notes || '';

        this.showView('addRecipe');
    }

    deleteRecipe(recipeId) {
        if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
            this.recipes = this.recipes.filter(r => r.id !== recipeId);
            this.saveRecipes();
            this.renderRecipes();
            this.showNotification('Recipe deleted successfully!', 'success');
        }
    }

    filterRecipes() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        const filteredRecipes = this.recipes.filter(recipe => {
            const matchesSearch = recipe.name.toLowerCase().includes(searchTerm) ||
                                recipe.ingredients.toLowerCase().includes(searchTerm) ||
                                recipe.instructions.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || recipe.category === categoryFilter;
            
            return matchesSearch && matchesCategory;
        });

        this.renderFilteredRecipes(filteredRecipes);
    }

    renderFilteredRecipes(recipes) {
        const recipesGrid = document.getElementById('recipesGrid');
        const noRecipes = document.getElementById('noRecipes');
        
        if (recipes.length === 0) {
            recipesGrid.style.display = 'none';
            noRecipes.style.display = 'block';
            noRecipes.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No recipes found</h3>
                <p>Try adjusting your search or filter criteria</p>
            `;
            return;
        }

        recipesGrid.style.display = 'grid';
        noRecipes.style.display = 'none';
        recipesGrid.innerHTML = recipes.map(recipe => this.createRecipeCard(recipe)).join('');
    }

    clearForm() {
        document.getElementById('recipeForm').reset();
        this.editingRecipeId = null;
    }

    closeModal() {
        document.getElementById('recipeModal').style.display = 'none';
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

    getRecipeTypeIcon(category) {
        const icons = {
            'mains': '<i class="fas fa-drumstick-bite"></i>',
            'appetizers': '<i class="fas fa-seedling"></i>',
            'sauces': '<i class="fas fa-tint"></i>',
            'sides': '<i class="fas fa-carrot"></i>',
            'desserts': '<i class="fas fa-birthday-cake"></i>',
            'beverages': '<i class="fas fa-coffee"></i>',
            'garnishes': '<i class="fas fa-leaf"></i>',
            'condiments': '<i class="fas fa-pepper-hot"></i>',
            'breads': '<i class="fas fa-bread-slice"></i>',
            'soups': '<i class="fas fa-bowl-food"></i>',
            'salads': '<i class="fas fa-apple-alt"></i>'
        };
        return icons[category] || '<i class="fas fa-utensils"></i>';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadRecipes() {
        try {
            const stored = localStorage.getItem('myRecipes');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading recipes:', error);
            return [];
        }
    }

    saveRecipes() {
        try {
            localStorage.setItem('myRecipes', JSON.stringify(this.recipes));
        } catch (error) {
            console.error('Error saving recipes:', error);
            this.showNotification('Error saving recipes. Please try again.', 'error');
        }
    }

    updateYear() {
        document.getElementById('year').textContent = new Date().getFullYear();
    }
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .recipe-detail {
        max-width: 100%;
    }
    
    .recipe-detail h2 {
        color: #333;
        margin-bottom: 1rem;
        font-size: 2rem;
    }
    
    .recipe-detail .recipe-meta {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }
    
    .recipe-detail .recipe-meta span {
        background: #f8f9fa;
        padding: 0.5rem 1rem;
        border-radius: 15px;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .recipe-section {
        margin-bottom: 2rem;
    }
    
    .recipe-section h3 {
        color: #667eea;
        margin-bottom: 1rem;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .ingredients-list {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid #667eea;
    }
    
    .ingredient-item {
        padding: 0.5rem 0;
        border-bottom: 1px solid #e9ecef;
    }
    
    .ingredient-item:last-child {
        border-bottom: none;
    }
    
    .instructions-list {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid #764ba2;
    }
    
    .instruction-item {
        display: flex;
        gap: 1rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e9ecef;
    }
    
    .instruction-item:last-child {
        border-bottom: none;
    }
    
    .step-number {
        background: #667eea;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        flex-shrink: 0;
    }
    
    .step-text {
        flex: 1;
        line-height: 1.5;
    }
`;
document.head.appendChild(notificationStyles);

// Initialize the application
const recipeManager = new RecipeManager();

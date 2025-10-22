const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

class Recipe {
    constructor() {
        this.db = new sqlite3.Database(config.database.path);
    }

    // Create a new recipe
    async create(recipeData) {
        return new Promise((resolve, reject) => {
            const {
                userId, name, category, prepTime, yield, difficulty,
                equipment, costPerPortion, ingredients, instructions,
                notes, allergens = [], dietary = []
            } = recipeData;

            this.db.serialize(() => {
                this.db.run(
                    `INSERT INTO recipes (user_id, name, category, prep_time, yield, difficulty, 
                     equipment, cost_per_portion, ingredients, instructions, notes) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [userId, name, category, prepTime, yield, difficulty,
                     equipment, costPerPortion, ingredients, instructions, notes],
                    function(err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        
                        const recipeId = this.lastID;
                        
                        // Insert allergens
                        if (allergens.length > 0) {
                            const allergenStmt = this.db.prepare('INSERT INTO allergens (recipe_id, allergen) VALUES (?, ?)');
                            allergens.forEach(allergen => {
                                allergenStmt.run(recipeId, allergen);
                            });
                            allergenStmt.finalize();
                        }
                        
                        // Insert dietary restrictions
                        if (dietary.length > 0) {
                            const dietaryStmt = this.db.prepare('INSERT INTO dietary (recipe_id, dietary) VALUES (?, ?)');
                            dietary.forEach(diet => {
                                dietaryStmt.run(recipeId, diet);
                            });
                            dietaryStmt.finalize();
                        }
                        
                        resolve({ id: recipeId, ...recipeData });
                    }
                );
            });
        });
    }

    // Get all recipes for a user
    async findByUserId(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM recipes WHERE user_id = ? ORDER BY date_created DESC',
                [userId],
                async (err, recipes) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    // Get allergens and dietary for each recipe
                    for (let recipe of recipes) {
                        recipe.allergens = await this.getRecipeAllergens(recipe.id);
                        recipe.dietary = await this.getRecipeDietary(recipe.id);
                    }
                    
                    resolve(recipes);
                }
            );
        });
    }

    // Get a single recipe by ID
    async findById(recipeId, userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM recipes WHERE id = ? AND user_id = ?',
                [recipeId, userId],
                async (err, recipe) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    if (!recipe) {
                        resolve(null);
                        return;
                    }
                    
                    // Get allergens and dietary
                    recipe.allergens = await this.getRecipeAllergens(recipe.id);
                    recipe.dietary = await this.getRecipeDietary(recipe.id);
                    
                    resolve(recipe);
                }
            );
        });
    }

    // Update a recipe
    async update(recipeId, userId, recipeData) {
        return new Promise((resolve, reject) => {
            const {
                name, category, prepTime, yield, difficulty,
                equipment, costPerPortion, ingredients, instructions,
                notes, allergens = [], dietary = []
            } = recipeData;

            this.db.serialize(() => {
                // Update recipe
                this.db.run(
                    `UPDATE recipes SET name = ?, category = ?, prep_time = ?, yield = ?, 
                     difficulty = ?, equipment = ?, cost_per_portion = ?, ingredients = ?, 
                     instructions = ?, notes = ?, date_modified = CURRENT_TIMESTAMP 
                     WHERE id = ? AND user_id = ?`,
                    [name, category, prepTime, yield, difficulty, equipment,
                     costPerPortion, ingredients, instructions, notes, recipeId, userId],
                    function(err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        
                        // Delete existing allergens and dietary
                        this.db.run('DELETE FROM allergens WHERE recipe_id = ?', [recipeId]);
                        this.db.run('DELETE FROM dietary WHERE recipe_id = ?', [recipeId]);
                        
                        // Insert new allergens
                        if (allergens.length > 0) {
                            const allergenStmt = this.db.prepare('INSERT INTO allergens (recipe_id, allergen) VALUES (?, ?)');
                            allergens.forEach(allergen => {
                                allergenStmt.run(recipeId, allergen);
                            });
                            allergenStmt.finalize();
                        }
                        
                        // Insert new dietary restrictions
                        if (dietary.length > 0) {
                            const dietaryStmt = this.db.prepare('INSERT INTO dietary (recipe_id, dietary) VALUES (?, ?)');
                            dietary.forEach(diet => {
                                dietaryStmt.run(recipeId, diet);
                            });
                            dietaryStmt.finalize();
                        }
                        
                        resolve({ id: recipeId, ...recipeData });
                    }
                );
            });
        });
    }

    // Delete a recipe
    async delete(recipeId, userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM recipes WHERE id = ? AND user_id = ?',
                [recipeId, userId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ deletedRows: this.changes });
                    }
                }
            );
        });
    }

    // Get allergens for a recipe
    async getRecipeAllergens(recipeId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT allergen FROM allergens WHERE recipe_id = ?',
                [recipeId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows.map(row => row.allergen));
                    }
                }
            );
        });
    }

    // Get dietary restrictions for a recipe
    async getRecipeDietary(recipeId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT dietary FROM dietary WHERE recipe_id = ?',
                [recipeId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows.map(row => row.dietary));
                    }
                }
            );
        });
    }

    // Close database connection
    close() {
        this.db.close();
    }
}

module.exports = Recipe;

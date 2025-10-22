const { Pool } = require('pg');
const config = require('../config-vercel');

class Recipe {
    constructor() {
        this.pool = new Pool(config.database);
    }

    // Create a new recipe
    async create(recipeData) {
        const {
            userId, name, category, prepTime, yield: recipeYield, difficulty,
            equipment, costPerPortion, ingredients, instructions,
            notes, allergens = [], dietary = []
        } = recipeData;

        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            // Insert recipe
            const recipeResult = await client.query(
                `INSERT INTO recipes (user_id, name, category, prep_time, yield, difficulty, 
                 equipment, cost_per_portion, ingredients, instructions, notes) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
                 RETURNING *`,
                [userId, name, category, prepTime, recipeYield, difficulty,
                 equipment, costPerPortion, ingredients, instructions, notes]
            );
            
            const recipe = recipeResult.rows[0];
            
            // Insert allergens
            if (allergens.length > 0) {
                for (const allergen of allergens) {
                    await client.query(
                        'INSERT INTO allergens (recipe_id, allergen) VALUES ($1, $2)',
                        [recipe.id, allergen]
                    );
                }
            }
            
            // Insert dietary restrictions
            if (dietary.length > 0) {
                for (const diet of dietary) {
                    await client.query(
                        'INSERT INTO dietary (recipe_id, dietary) VALUES ($1, $2)',
                        [recipe.id, diet]
                    );
                }
            }
            
            await client.query('COMMIT');
            return recipe;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Get all recipes for a user
    async findByUserId(userId) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM recipes WHERE user_id = $1 ORDER BY date_created DESC',
                [userId]
            );
            
            const recipes = result.rows;
            
            // Get allergens and dietary for each recipe
            for (let recipe of recipes) {
                recipe.allergens = await this.getRecipeAllergens(recipe.id);
                recipe.dietary = await this.getRecipeDietary(recipe.id);
            }
            
            return recipes;
        } finally {
            client.release();
        }
    }

    // Get a single recipe by ID
    async findById(recipeId, userId) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM recipes WHERE id = $1 AND user_id = $2',
                [recipeId, userId]
            );
            
            if (result.rows.length === 0) {
                return null;
            }
            
            const recipe = result.rows[0];
            
            // Get allergens and dietary
            recipe.allergens = await this.getRecipeAllergens(recipe.id);
            recipe.dietary = await this.getRecipeDietary(recipe.id);
            
            return recipe;
        } finally {
            client.release();
        }
    }

    // Update a recipe
    async update(recipeId, userId, recipeData) {
        const {
            name, category, prepTime, yield: recipeYield, difficulty,
            equipment, costPerPortion, ingredients, instructions,
            notes, allergens = [], dietary = []
        } = recipeData;

        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            // Update recipe
            const result = await client.query(
                `UPDATE recipes SET name = $1, category = $2, prep_time = $3, yield = $4, 
                 difficulty = $5, equipment = $6, cost_per_portion = $7, ingredients = $8, 
                 instructions = $9, notes = $10, date_modified = CURRENT_TIMESTAMP 
                 WHERE id = $11 AND user_id = $12 
                 RETURNING *`,
                [name, category, prepTime, recipeYield, difficulty, equipment,
                 costPerPortion, ingredients, instructions, notes, recipeId, userId]
            );
            
            if (result.rows.length === 0) {
                throw new Error('Recipe not found');
            }
            
            // Delete existing allergens and dietary
            await client.query('DELETE FROM allergens WHERE recipe_id = $1', [recipeId]);
            await client.query('DELETE FROM dietary WHERE recipe_id = $1', [recipeId]);
            
            // Insert new allergens
            if (allergens.length > 0) {
                for (const allergen of allergens) {
                    await client.query(
                        'INSERT INTO allergens (recipe_id, allergen) VALUES ($1, $2)',
                        [recipeId, allergen]
                    );
                }
            }
            
            // Insert new dietary restrictions
            if (dietary.length > 0) {
                for (const diet of dietary) {
                    await client.query(
                        'INSERT INTO dietary (recipe_id, dietary) VALUES ($1, $2)',
                        [recipeId, diet]
                    );
                }
            }
            
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Delete a recipe
    async delete(recipeId, userId) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                'DELETE FROM recipes WHERE id = $1 AND user_id = $2',
                [recipeId, userId]
            );
            
            return { deletedRows: result.rowCount };
        } finally {
            client.release();
        }
    }

    // Get allergens for a recipe
    async getRecipeAllergens(recipeId) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                'SELECT allergen FROM allergens WHERE recipe_id = $1',
                [recipeId]
            );
            
            return result.rows.map(row => row.allergen);
        } finally {
            client.release();
        }
    }

    // Get dietary restrictions for a recipe
    async getRecipeDietary(recipeId) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                'SELECT dietary FROM dietary WHERE recipe_id = $1',
                [recipeId]
            );
            
            return result.rows.map(row => row.dietary);
        } finally {
            client.release();
        }
    }

    // Close database connection
    async close() {
        await this.pool.end();
    }
}

module.exports = Recipe;

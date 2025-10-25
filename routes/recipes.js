const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../lib/auth');
const { validate, recipeSchema } = require('../validation');

// Get all recipes for the authenticated user
router.get('/', auth.authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM recipes WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        
        res.json({
            success: true,
            data: { recipes: result.rows }
        });
        
    } catch (error) {
        console.error('Get recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get a specific recipe by ID
router.get('/:id', auth.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'SELECT * FROM recipes WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }
        
        res.json({
            success: true,
            data: { recipe: result.rows[0] }
        });
        
    } catch (error) {
        console.error('Get recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Create a new recipe
router.post('/', auth.authenticateToken, validate(recipeSchema), async (req, res) => {
    try {
        const {
            name, description, category, prep_time, cook_time, servings,
            difficulty, ingredients, instructions, notes, image_url
        } = req.body;
        
        const result = await db.query(
            `INSERT INTO recipes (
                user_id, name, description, category, prep_time, cook_time, servings,
                difficulty, ingredients, instructions, notes, image_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
                req.user.id, name, description, category, prep_time, cook_time, servings,
                difficulty, ingredients, instructions, notes, image_url
            ]
        );
        
        const recipe = result.rows[0];
        
        res.status(201).json({
            success: true,
            message: 'Recipe created successfully',
            data: { recipe }
        });
        
    } catch (error) {
        console.error('Create recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update a recipe
router.put('/:id', auth.authenticateToken, validate(recipeSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, description, category, prep_time, cook_time, servings,
            difficulty, ingredients, instructions, notes, image_url
        } = req.body;
        
        // Check if recipe exists and belongs to user
        const existingRecipe = await db.query(
            'SELECT id FROM recipes WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (existingRecipe.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }
        
        const result = await db.query(
            `UPDATE recipes SET
                name = $1, description = $2, category = $3, prep_time = $4, cook_time = $5,
                servings = $6, difficulty = $7, ingredients = $8, instructions = $9,
                notes = $10, image_url = $11, updated_at = CURRENT_TIMESTAMP
            WHERE id = $12 AND user_id = $13
            RETURNING *`,
            [
                name, description, category, prep_time, cook_time, servings,
                difficulty, ingredients, instructions, notes, image_url, id, req.user.id
            ]
        );
        
        const recipe = result.rows[0];
        
        res.json({
            success: true,
            message: 'Recipe updated successfully',
            data: { recipe }
        });
        
    } catch (error) {
        console.error('Update recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete a recipe
router.delete('/:id', auth.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'DELETE FROM recipes WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Recipe deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Search recipes
router.get('/search/:query', auth.authenticateToken, async (req, res) => {
    try {
        const { query } = req.params;
        const searchTerm = `%${query}%`;
        
        const result = await db.query(
            `SELECT * FROM recipes 
            WHERE user_id = $1 
            AND (name ILIKE $2 OR description ILIKE $2 OR category ILIKE $2)
            ORDER BY created_at DESC`,
            [req.user.id, searchTerm]
        );
        
        res.json({
            success: true,
            data: { recipes: result.rows }
        });
        
    } catch (error) {
        console.error('Search recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
const express = require('express');
const Recipe = require('../models/Recipe');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all recipes for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const recipe = new Recipe();
        const recipes = await recipe.findByUserId(req.user.id);
        recipe.close();

        res.json(recipes);
    } catch (error) {
        console.error('Get recipes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a single recipe by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id);
        const recipe = new Recipe();
        
        const recipeData = await recipe.findById(recipeId, req.user.id);
        recipe.close();

        if (!recipeData) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        res.json(recipeData);
    } catch (error) {
        console.error('Get recipe error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new recipe
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            name, category, prepTime, yield, difficulty,
            equipment, costPerPortion, ingredients, instructions,
            notes, allergens = [], dietary = []
        } = req.body;

        // Validate required fields
        if (!name || !category || !ingredients || !instructions) {
            return res.status(400).json({ 
                error: 'Name, category, ingredients, and instructions are required' 
            });
        }

        const recipe = new Recipe();
        
        const recipeData = {
            userId: req.user.id,
            name,
            category,
            prepTime: prepTime || null,
            yield: yield || null,
            difficulty: difficulty || null,
            equipment: equipment || null,
            costPerPortion: costPerPortion || null,
            ingredients,
            instructions,
            notes: notes || null,
            allergens,
            dietary
        };

        const newRecipe = await recipe.create(recipeData);
        recipe.close();

        res.status(201).json(newRecipe);
    } catch (error) {
        console.error('Create recipe error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a recipe
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id);
        const {
            name, category, prepTime, yield, difficulty,
            equipment, costPerPortion, ingredients, instructions,
            notes, allergens = [], dietary = []
        } = req.body;

        // Validate required fields
        if (!name || !category || !ingredients || !instructions) {
            return res.status(400).json({ 
                error: 'Name, category, ingredients, and instructions are required' 
            });
        }

        const recipe = new Recipe();
        
        // Check if recipe exists and belongs to user
        const existingRecipe = await recipe.findById(recipeId, req.user.id);
        if (!existingRecipe) {
            recipe.close();
            return res.status(404).json({ error: 'Recipe not found' });
        }

        const recipeData = {
            name,
            category,
            prepTime: prepTime || null,
            yield: yield || null,
            difficulty: difficulty || null,
            equipment: equipment || null,
            costPerPortion: costPerPortion || null,
            ingredients,
            instructions,
            notes: notes || null,
            allergens,
            dietary
        };

        const updatedRecipe = await recipe.update(recipeId, req.user.id, recipeData);
        recipe.close();

        res.json(updatedRecipe);
    } catch (error) {
        console.error('Update recipe error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a recipe
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id);
        const recipe = new Recipe();
        
        const result = await recipe.delete(recipeId, req.user.id);
        recipe.close();

        if (result.deletedRows === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Delete recipe error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

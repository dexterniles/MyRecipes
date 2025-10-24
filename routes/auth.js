const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const { validate, userRegistrationSchema, userLoginSchema } = require('../validation');

// Register new user
router.post('/register', validate(userRegistrationSchema), async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }
        
        // Hash password
        const passwordHash = await auth.hashPassword(password);
        
        // Create user
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
            [username, email, passwordHash]
        );
        
        const user = result.rows[0];
        
        // Generate token
        const token = auth.generateToken(user);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    created_at: user.created_at
                },
                token
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// Login user
router.post('/login', validate(userLoginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const result = await db.query(
            'SELECT id, username, email, password_hash, created_at FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        const user = result.rows[0];
        
        // Verify password
        const isValidPassword = await auth.comparePassword(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Generate token
        const token = auth.generateToken(user);
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    created_at: user.created_at
                },
                token
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});

// Get current user info
router.get('/me', auth.authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const user = result.rows[0];
        
        res.json({
            success: true,
            data: { user }
        });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

module.exports = router;
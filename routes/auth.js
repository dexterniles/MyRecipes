const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const user = new User();

        // Check if user already exists
        const existingUser = await user.findByUsername(username);
        if (existingUser) {
            user.close();
            return res.status(400).json({ error: 'Username already exists' });
        }

        const existingEmail = await user.findByEmail(email);
        if (existingEmail) {
            user.close();
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create new user
        const newUser = await user.create(username, email, password);
        user.close();

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.id, username: newUser.username },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: newUser.id, username: newUser.username, email: newUser.email }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = new User();

        // Find user by username
        const userData = await user.findByUsername(username);
        if (!userData) {
            user.close();
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        if (!user.verifyPassword(password, userData.password_hash)) {
            user.close();
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        user.close();

        // Generate JWT token
        const token = jwt.sign(
            { userId: userData.id, username: userData.username },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: userData.id, username: userData.username, email: userData.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user info
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        const user = new User();
        
        const userData = await user.findById(decoded.userId);
        user.close();

        if (!userData) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({
            user: { id: userData.id, username: userData.username, email: userData.email }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

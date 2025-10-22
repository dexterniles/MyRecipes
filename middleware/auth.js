const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = new User();
        
        const userData = await user.findById(decoded.userId);
        if (!userData) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        req.user = userData;
        user.close();
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

module.exports = { authenticateToken };

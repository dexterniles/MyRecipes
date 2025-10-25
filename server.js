const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const validateEnv = require('./lib/validate-env');
const db = require('./db');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');

// Validate environment variables before starting
validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware - with enhanced security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "data:", "blob:"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "data:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "data:"],
            fontSrc: ["'self'", "'unsafe-inline'", "https:", "data:", "*"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https:", "wss:"],
            objectSrc: ["'none'"],
            frameSrc: ["'self'", "https:"],
            mediaSrc: ["'self'", "https:", "data:"],
            workerSrc: ["'self'", "blob:"]
        }
    },
    // Additional security headers
    strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    xContentTypeOptions: true,
    xFrameOptions: { action: 'deny' },
    xXssProtection: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permissionsPolicy: {
        features: {
            camera: ["'none'"],
            microphone: ["'none'"],
            geolocation: ["'none'"]
        }
    }
}));

// Rate limiting - protect against brute force attacks
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit login attempts
    message: { success: false, message: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit registration attempts
    message: { success: false, message: 'Too many registration attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
}));

// HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        // Check if request is secure (HTTPS)
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes with rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = await db.testConnection();
        res.json({
            success: true,
            message: 'PrepSync API is running',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            database: dbStatus.success ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'API health check failed',
            error: error.message
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'PrepSync API test endpoint',
        timestamp: new Date().toISOString()
    });
});

// Serve static files (for frontend)
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        } else if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
        } else if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.gif') || filePath.endsWith('.svg')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
    }
}));

// Explicit routes for static files (Vercel compatibility)
app.get('/styles.css', (req, res) => {
    console.log('📄 Serving styles.css');
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'script.js'));
});

// Explicit routes for js/ directory files (Vercel compatibility)
app.get('/js/api.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'js', 'api.js'));
});

app.get('/js/auth.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'js', 'auth.js'));
});

app.get('/js/sanitize.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'js', 'sanitize.js'));
});

app.get('/js/password-validator.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'js', 'password-validator.js'));
});

app.get('/js/error-handler.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'js', 'error-handler.js'));
});

app.get('/js/logger.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'js', 'logger.js'));
});

app.get('/js/cache.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'js', 'cache.js'));
});

app.get('/js/pagination.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'js', 'pagination.js'));
});

// Serve main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
async function startServer() {
    try {
        // Test database connection
        const dbStatus = await db.testConnection();
        if (dbStatus.success) {
            console.log('✅ Database connected successfully');
        } else {
            console.log('⚠️  Database connection failed:', dbStatus.error);
        }
        
        app.listen(PORT, () => {
            console.log('🚀 PrepSync Server Started!');
            console.log(`📍 Server running on port ${PORT}`);
            console.log(`🌐 Frontend: http://localhost:${PORT}`);
            console.log(`🔧 API: http://localhost:${PORT}/api`);
            console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
            console.log(`🔒 Protected Route: http://localhost:${PORT}/api/recipes`);
            console.log('📋 Available endpoints:');
            console.log('   POST /api/auth/register - Register new user');
            console.log('   POST /api/auth/login - Login user');
            console.log('   GET  /api/auth/me - Get current user');
            console.log('   GET  /api/recipes - Get all recipes');
            console.log('   POST /api/recipes - Create new recipe');
            console.log('   GET  /api/recipes/:id - Get specific recipe');
            console.log('   PUT  /api/recipes/:id - Update recipe');
            console.log('   DELETE /api/recipes/:id - Delete recipe');
            console.log('   GET  /api/recipes/search/:query - Search recipes');
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();

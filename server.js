const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const config = require('./config.local');

const { testConnection, initDatabase } = require('./lib/db');
const { authenticateToken } = require('./lib/auth');

// Import route handlers (we'll create these in the next phase)
// const authRoutes = require('./routes/auth');
// const recipeRoutes = require('./routes/recipes');

const app = express();
const PORT = config.PORT;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving (serve from root directory for now)
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PrepSync API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes (we'll implement these in the next phase)
// app.use('/api/auth', authRoutes);
// app.use('/api/recipes', authenticateToken, recipeRoutes);

// Temporary placeholder routes for testing
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Protected route example
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected route',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.log('⚠️  Database connection failed, but continuing with server startup...');
      console.log('⚠️  Some features may not work without a database connection');
    }

    // Initialize database tables
    if (dbConnected) {
      await initDatabase();
    }

    // Start the server
    app.listen(PORT, () => {
      console.log('🚀 PrepSync Server Started!');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌐 Frontend: http://localhost:${PORT}`);
      console.log(`🔧 API: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔒 Protected Route: http://localhost:${PORT}/api/protected`);
      console.log('');
      console.log('📋 Next Steps:');
      console.log('   1. Set up your database connection');
      console.log('   2. Implement authentication routes');
      console.log('   3. Implement recipe CRUD routes');
      console.log('   4. Update frontend to use API');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

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

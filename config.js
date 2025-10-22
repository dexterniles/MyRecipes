module.exports = {
  // Database Configuration
  database: {
    path: process.env.DB_PATH || './database/recipes.db'
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: '7d'
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8000'
  }
};

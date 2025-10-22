// Local configuration for development
module.exports = {
  // Database Configuration (will be configured in Phase 2)
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/prepsync',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'prepsync',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'prepsync-super-secret-jwt-key-2024',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Server Configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3001'
};

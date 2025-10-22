const { Pool } = require('pg');
const config = require('../config.local');

// Database connection configuration
const dbConfig = {
  connectionString: config.DATABASE_URL,
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
let pool = null;

try {
  // Create pool if DATABASE_URL is provided
  if (config.DATABASE_URL) {
    pool = new Pool(dbConfig);
    console.log('✅ Database connection pool created');
  } else {
    console.log('⚠️  No DATABASE_URL provided - database features disabled');
  }
} catch (error) {
  console.log('⚠️  Database pool creation failed:', error.message);
}

// Test database connection
const testConnection = async () => {
  if (!pool) {
    console.log('⚠️  Database not configured - set DATABASE_URL to enable');
    return false;
  }
  
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
const initDatabase = async () => {
  if (!pool) {
    console.log('⚠️  Database initialization skipped - set DATABASE_URL to enable');
    return false;
  }
  
  try {
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create recipes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        prep_time INTEGER,
        yield VARCHAR(100),
        difficulty VARCHAR(50),
        equipment TEXT,
        allergens TEXT[],
        dietary TEXT[],
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL,
        cost_per_portion DECIMAL(10,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
      CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    console.log('✅ Database tables initialized successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

// Graceful shutdown
const closePool = async () => {
  if (!pool) {
    return;
  }
  
  try {
    await pool.end();
    console.log('✅ Database connection pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error.message);
  }
};

// Handle process termination
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

module.exports = {
  pool,
  testConnection,
  initDatabase,
  closePool
};

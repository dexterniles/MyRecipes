const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

async function initializeDatabase() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    
    console.log('✅ Database connected successfully');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Reading schema file...');
    
    // Execute schema
    console.log('🚀 Initializing database schema...');
    await client.query(schema);
    
    console.log('✅ Database schema initialized successfully');
    
    // Test the tables
    const usersResult = await client.query('SELECT COUNT(*) FROM users');
    const recipesResult = await client.query('SELECT COUNT(*) FROM recipes');
    
    console.log(`📊 Users table: ${usersResult.rows[0].count} records`);
    console.log(`📊 Recipes table: ${recipesResult.rows[0].count} records`);
    
    client.release();
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };

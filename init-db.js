const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase
    }
});

async function initDatabase() {
    try {
        console.log('🚀 Starting database initialization...');
        
        // Test connection first
        const client = await pool.connect();
        console.log('✅ Connected to Supabase database');
        
        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📋 Executing database schema...');
        await client.query(schema);
        console.log('✅ Database schema created successfully');
        
        // Test the tables
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `);
        
        console.log('📊 Created tables:', tablesResult.rows.map(row => row.table_name));
        
        client.release();
        console.log('🎉 Database initialization complete!');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase, pool };

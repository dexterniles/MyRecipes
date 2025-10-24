const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase
    }
});

async function testConnection() {
    try {
        console.log('🔍 Testing database connection...');
        
        const client = await pool.connect();
        console.log('✅ Successfully connected to Supabase database');
        
        // Test basic query
        const result = await client.query('SELECT NOW() as current_time');
        console.log('⏰ Database time:', result.rows[0].current_time);
        
        // Check if tables exist
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        if (tablesResult.rows.length > 0) {
            console.log('📊 Existing tables:', tablesResult.rows.map(row => row.table_name));
        } else {
            console.log('📊 No tables found - run "npm run init-db" to create the schema');
        }
        
        client.release();
        console.log('🎉 Database connection test successful!');
        
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    testConnection();
}

module.exports = { testConnection };

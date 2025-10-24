const { Pool } = require('pg');
require('dotenv').config();

// Database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase
    }
});

// Test database connection
async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time');
        client.release();
        return { success: true, time: result.rows[0].current_time };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get a client from the pool
async function getClient() {
    return await pool.connect();
}

// Execute a query with error handling
async function query(text, params) {
    const client = await getClient();
    try {
        const result = await client.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    testConnection,
    getClient,
    query
};

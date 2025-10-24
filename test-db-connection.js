require('dotenv').config();
const db = require('./db');

async function testConnection() {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    try {
        const result = await db.testConnection();
        console.log('Connection result:', result);
        
        if (result.success) {
            console.log('✅ Database connection successful');
        } else {
            console.log('❌ Database connection failed:', result.error);
        }
    } catch (error) {
        console.log('❌ Database connection error:', error.message);
    }
}

testConnection();

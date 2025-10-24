require('dotenv').config();
const db = require('./db');

async function testRegistration() {
    console.log('Testing registration...');
    
    try {
        // Test if we can query the users table
        const result = await db.query('SELECT COUNT(*) FROM users');
        console.log('✅ Users table accessible, count:', result.rows[0].count);
        
        // Test if we can insert a user
        const insertResult = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            ['testuser', 'test@example.com', 'hashedpassword']
        );
        console.log('✅ User insertion successful, ID:', insertResult.rows[0].id);
        
        // Clean up test user
        await db.query('DELETE FROM users WHERE id = $1', [insertResult.rows[0].id]);
        console.log('✅ Test user cleaned up');
        
    } catch (error) {
        console.log('❌ Registration test failed:', error.message);
    }
}

testRegistration();

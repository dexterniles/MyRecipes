require('dotenv').config();
const db = require('./db');
const auth = require('./auth');

async function testAPI() {
    console.log('Testing API components...');
    
    try {
        // Test database connection
        const dbResult = await db.testConnection();
        console.log('✅ Database connection:', dbResult.success ? 'OK' : 'FAILED');
        
        // Test password hashing
        const hashedPassword = await auth.hashPassword('testpassword123');
        console.log('✅ Password hashing:', hashedPassword ? 'OK' : 'FAILED');
        
        // Test password comparison
        const isValid = await auth.comparePassword('testpassword123', hashedPassword);
        console.log('✅ Password comparison:', isValid ? 'OK' : 'FAILED');
        
        // Test JWT token generation
        const token = auth.generateToken({ id: 1, username: 'test', email: 'test@example.com' });
        console.log('✅ JWT token generation:', token ? 'OK' : 'FAILED');
        
        // Test JWT token verification
        const decoded = auth.verifyToken(token);
        console.log('✅ JWT token verification:', decoded ? 'OK' : 'FAILED');
        
        console.log('\n🎉 All API components working correctly!');
        
    } catch (error) {
        console.log('❌ API test failed:', error.message);
    }
}

testAPI();

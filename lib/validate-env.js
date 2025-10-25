/**
 * Environment Variable Validation
 * Ensures all required environment variables are set before server starts
 */

function validateEnv() {
    const required = [
        'DATABASE_URL',
        'JWT_SECRET'
    ];

    const missing = [];
    
    for (const varName of required) {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    }

    if (missing.length > 0) {
        console.error('\n❌ ERROR: Missing required environment variables:');
        missing.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\nPlease set these variables in your .env file or environment.\n');
        process.exit(1);
    }

    // Validate DATABASE_URL format
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgres')) {
        console.error('\n❌ ERROR: DATABASE_URL must be a PostgreSQL connection string');
        console.error('Example: postgresql://user:password@host:port/database\n');
        process.exit(1);
    }

    // Validate JWT_SECRET strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        console.warn('\n⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security');
        console.warn('Current length:', process.env.JWT_SECRET.length);
        console.warn('Consider using a longer, more secure secret\n');
    }

    // Validate PORT is a number
    if (process.env.PORT && isNaN(process.env.PORT)) {
        console.error('\n❌ ERROR: PORT must be a number');
        process.exit(1);
    }

    console.log('✅ Environment variables validated successfully\n');
}

module.exports = validateEnv;

const { Pool } = require('pg');

// This script helps set up a local database for development
// You can use either a local PostgreSQL instance or a cloud database

const setupLocalDatabase = async () => {
  console.log('🗄️  PrepSync Local Database Setup');
  console.log('=====================================');
  
  console.log('\n📋 Database Setup Options:');
  console.log('1. Local PostgreSQL (requires PostgreSQL installed)');
  console.log('2. Cloud Database (Neon, Supabase, etc.)');
  console.log('3. Vercel Postgres (for production)');
  
  console.log('\n🔧 To set up a local PostgreSQL database:');
  console.log('1. Install PostgreSQL: https://www.postgresql.org/download/');
  console.log('2. Create a database named "prepsync"');
  console.log('3. Set your DATABASE_URL environment variable');
  
  console.log('\n🌐 To use a cloud database:');
  console.log('1. Sign up for a free database service (Neon, Supabase, etc.)');
  console.log('2. Get your connection string');
  console.log('3. Set your DATABASE_URL environment variable');
  
  console.log('\n📝 Example DATABASE_URL formats:');
  console.log('Local: postgresql://username:password@localhost:5432/prepsync');
  console.log('Cloud: postgresql://username:password@host:port/database');
  
  console.log('\n🚀 To test your database connection:');
  console.log('1. Set DATABASE_URL in your environment');
  console.log('2. Run: npm run init-db');
  console.log('3. Start your server: npm start');
  
  console.log('\n💡 Pro tip: Create a .env file with your DATABASE_URL');
  console.log('   (Note: .env files are gitignored for security)');
};

// Run setup if called directly
if (require.main === module) {
  setupLocalDatabase();
}

module.exports = { setupLocalDatabase };

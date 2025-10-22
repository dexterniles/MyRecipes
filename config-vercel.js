module.exports = {
  // Database Configuration for Vercel (PostgreSQL)
  database: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: '7d'
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    corsOrigin: process.env.CORS_ORIGIN || 'https://your-app.vercel.app'
  }
};

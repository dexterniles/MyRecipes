# 🗄️ PrepSync Database Setup Guide

This guide will help you set up the database for PrepSync, which can work with local PostgreSQL or cloud databases like Vercel Postgres.

## 🚀 Quick Start Options

### Option 1: Vercel Postgres (Recommended for Production)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Create a Vercel Postgres database**:
   ```bash
   vercel postgres create prepsync-db
   ```

4. **Link your project** (run this in your project directory):
   ```bash
   vercel link
   ```

5. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```

6. **Initialize the database**:
   ```bash
   npm run init-db
   ```

### Option 2: Local PostgreSQL

1. **Install PostgreSQL**:
   - macOS: `brew install postgresql`
   - Windows: Download from https://www.postgresql.org/download/
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Create a database**:
   ```bash
   createdb prepsync
   ```

3. **Set environment variable**:
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/prepsync"
   ```

4. **Initialize the database**:
   ```bash
   npm run init-db
   ```

### Option 3: Cloud Database (Neon, Supabase, etc.)

1. **Sign up for a cloud database service**:
   - [Neon](https://neon.tech/) (Free tier available)
   - [Supabase](https://supabase.com/) (Free tier available)
   - [Railway](https://railway.app/) (Free tier available)

2. **Create a new database project**

3. **Get your connection string** from the dashboard

4. **Set environment variable**:
   ```bash
   export DATABASE_URL="your-connection-string-here"
   ```

5. **Initialize the database**:
   ```bash
   npm run init-db
   ```

## 🔧 Environment Variables

Create a `.env` file in your project root with:

```env
DATABASE_URL=your-database-connection-string
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3001
```

## 📊 Database Schema

The database includes two main tables:

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Hashed password
- `name` - User's display name
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Recipes Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `name` - Recipe name
- `category` - Recipe category
- `prep_time` - Preparation time in minutes
- `yield` - Recipe yield/quantity
- `difficulty` - Difficulty level
- `equipment` - Required equipment
- `allergens` - Array of allergens
- `dietary` - Array of dietary restrictions
- `ingredients` - Recipe ingredients
- `instructions` - Recipe instructions
- `cost_per_portion` - Cost per serving
- `notes` - Additional notes
- `created_at` - Recipe creation timestamp
- `updated_at` - Last update timestamp

## 🧪 Testing Your Database

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Check the health endpoint**:
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Test database connection**:
   ```bash
   curl http://localhost:3001/api/test
   ```

## 🚀 Deployment

### Vercel Deployment

1. **Push your code to GitHub**

2. **Connect to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**

4. **Deploy**:
   ```bash
   vercel deploy
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Database connection failed**:
   - Check your DATABASE_URL format
   - Ensure the database server is running
   - Verify credentials are correct

2. **Permission denied**:
   - Check database user permissions
   - Ensure the database exists

3. **SSL connection issues**:
   - For local development, SSL is usually disabled
   - For cloud databases, SSL is usually required

### Getting Help

- Check the server logs for detailed error messages
- Verify your environment variables
- Test your database connection string separately

## 📝 Next Steps

Once your database is set up:

1. ✅ **Phase 2 Complete**: Database is connected and initialized
2. 🔄 **Phase 3**: Implement authentication system
3. 🔄 **Phase 4**: Create API endpoints for recipes
4. 🔄 **Phase 5**: Update frontend to use the API

Happy cooking! 👨‍🍳👩‍🍳

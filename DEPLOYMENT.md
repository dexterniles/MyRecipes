# Deploying MyRecipes to Vercel

This guide will help you deploy your MyRecipes application to Vercel with a cloud database.

## Option 1: Quick Deploy with Supabase (Recommended)

### Step 1: Set up Supabase Database

1. **Create a Supabase account:**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Set up the database:**
   - Go to your Supabase project dashboard
   - Navigate to "SQL Editor"
   - Run the SQL from `database/schema-postgres.sql` to create tables

3. **Get your database credentials:**
   - Go to Settings → Database
   - Copy your database credentials

### Step 2: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Configure environment variables:**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   POSTGRES_HOST=your-supabase-host
   POSTGRES_PORT=5432
   POSTGRES_DATABASE=postgres
   POSTGRES_USERNAME=postgres
   POSTGRES_PASSWORD=your-supabase-password
   JWT_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=https://your-app.vercel.app
   ```

4. **Deploy:**
   ```bash
   vercel
   ```

5. **Set environment variables in Vercel:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add all the variables from your `.env.local`

## Option 2: Using Vercel Postgres

### Step 1: Create Vercel Postgres Database

1. **Install Vercel Postgres:**
   ```bash
   vercel storage create postgres
   ```

2. **Get connection details:**
   ```bash
   vercel env pull .env.local
   ```

### Step 2: Deploy

1. **Deploy to Vercel:**
   ```bash
   vercel
   ```

2. **Run database migrations:**
   ```bash
   vercel env pull .env.local
   # Then run the schema from database/schema-postgres.sql
   ```

## Option 3: Using PlanetScale (MySQL)

### Step 1: Set up PlanetScale

1. **Create PlanetScale account:**
   - Go to [planetscale.com](https://planetscale.com)
   - Sign up for a free account
   - Create a new database

2. **Get connection details:**
   - Copy your connection string from PlanetScale dashboard

### Step 2: Modify for MySQL

You'll need to update the database models to use MySQL instead of PostgreSQL.

## Configuration Files for Vercel

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Environment Variables

Set these in your Vercel dashboard:

- `POSTGRES_HOST` - Your database host
- `POSTGRES_PORT` - Database port (usually 5432)
- `POSTGRES_DATABASE` - Database name
- `POSTGRES_USERNAME` - Database username
- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGIN` - Your Vercel app URL

## Updating Your Code for Vercel

### 1. Update package.json
Replace your current `package.json` with `package-vercel.json`:
```bash
mv package-vercel.json package.json
```

### 2. Update database models
Replace your current models with the PostgreSQL versions:
```bash
mv models/Recipe-postgres.js models/Recipe.js
mv models/User-postgres.js models/User.js
```

### 3. Update config
Replace your current config with the Vercel version:
```bash
mv config-vercel.js config.js
```

### 4. Update API service
Update `js/api.js` to use your Vercel domain:
```javascript
// Change this line:
this.baseURL = 'http://localhost:3000/api';

// To:
this.baseURL = 'https://your-app.vercel.app/api';
```

## Deployment Steps Summary

1. **Choose your database provider** (Supabase recommended)
2. **Set up your database** and run the schema
3. **Update your code** for Vercel deployment
4. **Install Vercel CLI** and login
5. **Deploy with `vercel`**
6. **Set environment variables** in Vercel dashboard
7. **Update your frontend** to use the Vercel URL

## Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Check your environment variables
   - Ensure your database allows connections from Vercel

2. **CORS errors:**
   - Update CORS_ORIGIN to your Vercel domain
   - Check your API service baseURL

3. **Build errors:**
   - Ensure all dependencies are in package.json
   - Check that all files are properly committed

### Testing Locally

You can test your Vercel deployment locally:

```bash
vercel dev
```

This will run your app locally with Vercel's environment.

## Production Considerations

1. **Security:**
   - Use strong JWT secrets
   - Enable HTTPS
   - Set up proper CORS origins

2. **Performance:**
   - Consider database connection pooling
   - Implement caching for frequently accessed data

3. **Monitoring:**
   - Set up error tracking
   - Monitor database performance
   - Use Vercel Analytics

## Cost Considerations

- **Vercel:** Free tier available, paid plans for production
- **Supabase:** Free tier with generous limits
- **PlanetScale:** Free tier available
- **Vercel Postgres:** Pay-per-use pricing

Choose the option that best fits your needs and budget!

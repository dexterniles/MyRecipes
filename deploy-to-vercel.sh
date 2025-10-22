#!/bin/bash

echo "🚀 Deploying MyRecipes to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

echo "📦 Preparing for deployment..."

# Create backup of original files
echo "💾 Creating backups..."
cp package.json package.json.backup
cp config.js config.js.backup
cp models/Recipe.js models/Recipe.js.backup
cp models/User.js models/User.js.backup

# Switch to Vercel-compatible versions
echo "🔄 Switching to Vercel-compatible versions..."
mv package-vercel.json package.json
mv config-vercel.js config.js
mv models/Recipe-postgres.js models/Recipe.js
mv models/User-postgres.js models/User.js

# Update API service for production
echo "🌐 Updating API service for production..."
sed -i.bak 's|http://localhost:3000/api|https://your-app.vercel.app/api|g' js/api.js

echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Set up your database (Supabase recommended)"
echo "3. Add environment variables:"
echo "   - POSTGRES_HOST"
echo "   - POSTGRES_PORT"
echo "   - POSTGRES_DATABASE"
echo "   - POSTGRES_USERNAME"
echo "   - POSTGRES_PASSWORD"
echo "   - JWT_SECRET"
echo "   - CORS_ORIGIN"
echo "4. Update the API baseURL in js/api.js with your actual Vercel domain"
echo "5. Run the database schema from database/schema-postgres.sql"
echo ""
echo "🔄 To restore original files:"
echo "mv package.json.backup package.json"
echo "mv config.js.backup config.js"
echo "mv models/Recipe.js.backup models/Recipe.js"
echo "mv models/User.js.backup models/User.js"

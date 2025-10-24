#!/bin/bash

# PrepSync Vercel Deployment Script
echo "🚀 Deploying PrepSync to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app is now live at the URL provided above"
echo ""
echo "📋 Next steps:"
echo "1. Add environment variables in Vercel dashboard:"
echo "   - DATABASE_URL: Your Supabase connection string"
echo "   - JWT_SECRET: Generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
echo "   - NODE_ENV: production"
echo "2. Test your deployed application"
echo "3. Share the URL with your team!"

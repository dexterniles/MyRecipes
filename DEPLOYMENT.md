# 🚀 PrepSync Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free at vercel.com)
- Your Supabase database URL

## Step 1: Push to GitHub

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - PrepSync application"
   ```

2. **Create GitHub Repository**:
   - Go to github.com
   - Click "New repository"
   - Name it "prepsync" or "my-recipes"
   - Make it public or private (your choice)
   - Don't initialize with README (we already have files)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose your project settings
   - Vercel will automatically detect it's a Node.js app

### Option B: Vercel Dashboard
1. **Go to vercel.com** and sign in
2. **Click "New Project"**
3. **Import from GitHub**:
   - Select your PrepSync repository
   - Click "Import"
4. **Configure Project**:
   - Framework Preset: "Other"
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

## Step 3: Configure Environment Variables

In your Vercel dashboard:

1. **Go to your project settings**
2. **Click "Environment Variables"**
3. **Add these variables**:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `JWT_SECRET`: A secure random string (generate one)
   - `NODE_ENV`: `production`

### Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 4: Deploy

1. **Trigger deployment**:
   - If using CLI: `vercel --prod`
   - If using dashboard: Click "Deploy"

2. **Wait for deployment** (usually 1-2 minutes)

3. **Get your live URL**:
   - Vercel will provide a URL like: `https://your-app-name.vercel.app`

## Step 5: Test Your Deployment

1. **Visit your live URL**
2. **Test registration/login**
3. **Test adding recipes**
4. **Verify database connectivity**

## Troubleshooting

### Common Issues:
- **Database connection errors**: Check DATABASE_URL in environment variables
- **Build failures**: Ensure all dependencies are in package.json
- **Static files not loading**: Check vercel.json configuration

### Environment Variables Checklist:
- ✅ `DATABASE_URL` - Your Supabase connection string
- ✅ `JWT_SECRET` - Secure random string
- ✅ `NODE_ENV` - Set to `production`

## Your Live Application

Once deployed, your PrepSync application will be available at:
`https://your-app-name.vercel.app`

You can now:
- ✅ Access from any device
- ✅ Share with team members
- ✅ Use in professional kitchens
- ✅ Sync recipes across devices

## Next Steps

1. **Custom Domain** (optional):
   - Add your own domain in Vercel settings
   - Configure DNS settings

2. **Monitoring**:
   - Use Vercel Analytics (free)
   - Monitor performance and usage

3. **Updates**:
   - Push changes to GitHub
   - Vercel auto-deploys on git push

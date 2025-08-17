# Deploy StoreReview to Render

This guide will help you deploy your StoreReview application to Render.

## Prerequisites

1. **GitHub Account** - You need a GitHub account
2. **Render Account** - Sign up at https://render.com (free tier available)
3. **Your project** - Should be in a Git repository

## Step 1: Push to GitHub

First, create a GitHub repository and push your code:

1. Go to https://github.com and create a new repository named `storereview-app`
2. In your project directory, run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/storereview-app.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Render

1. **Login to Render** at https://render.com
2. **Click "New +"** and select **"Web Service"**
3. **Connect your GitHub repository**:
   - Choose "Build and deploy from a Git repository"
   - Connect your GitHub account
   - Select your `storereview-app` repository
4. **Configure the service**:
   - **Name**: `storereview-backend`
   - **Runtime**: Node
   - **Build Command**: `cd storereview-backend/server && npm install`
   - **Start Command**: `cd storereview-backend/server && npm start`
   - **Plan**: Free (or paid if you prefer)

5. **Set Environment Variables**:
   Click on "Environment" and add:
   ```
   JWT_SECRET=your_super_secure_jwt_secret_key_here_12345_production
   NODE_ENV=production
   ```

6. **Deploy**: Click "Create Web Service"

## Step 3: Deploy Frontend to Render

1. **After backend is deployed**, click "New +" again and select **"Static Site"**
2. **Connect the same repository**
3. **Configure the static site**:
   - **Name**: `storereview-frontend`
   - **Build Command**: `cd storereview-frontend && npm install && npm run build`
   - **Publish Directory**: `storereview-frontend/out`

4. **Set Environment Variables**:
   After the backend is deployed, get its URL and add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```
   (Replace `your-backend-url` with your actual backend service URL)

5. **Deploy**: Click "Create Static Site"

## Step 4: Update CORS Configuration

1. **Go to your backend service** on Render dashboard
2. **Go to Environment tab**
3. **Add environment variable**:
   ```
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```
   (Replace with your actual frontend URL)

4. **Redeploy** the backend service

## Step 5: Test Your Deployment

1. Visit your frontend URL (provided by Render)
2. Try registering a new user
3. Test login functionality
4. Create a store (if you're a store owner)
5. Submit a rating

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in package.json

2. **API Calls Fail**:
   - Verify CORS is configured correctly
   - Check that NEXT_PUBLIC_API_URL is set correctly

3. **Database Issues**:
   - SQLite database will be created automatically
   - Data will persist on Render's file system

### Environment Variables Summary:

**Backend (`storereview-backend`)**:
```
JWT_SECRET=your_super_secure_jwt_secret_key_here_12345_production
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.onrender.com
```

**Frontend (`storereview-frontend`)**:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

## Important Notes

1. **Free Tier Limitations**:
   - Services sleep after 15 minutes of inactivity
   - First request after sleep may take 30-60 seconds

2. **Database Persistence**:
   - SQLite file will persist on the same instance
   - Data may be lost if service is redeployed

3. **SSL/HTTPS**:
   - All Render deployments come with SSL certificates
   - Your app will be available over HTTPS

## Success!

Your StoreReview application should now be live at:
- **Frontend**: https://your-frontend-url.onrender.com  
- **Backend API**: https://your-backend-url.onrender.com

You can share these URLs for portfolio or interview purposes!

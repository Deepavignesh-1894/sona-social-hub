# Sona Social Hub - Deployment Guide

## Overview
This application consists of:
- **Frontend**: React + Vite (deployed to Vercel)
- **Backend**: Node.js + Express (deployed to Render)
- **Database**: MongoDB Atlas

## Prerequisites
- MongoDB Atlas account
- Render account
- Vercel account
- GitHub repository

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier is fine)
3. Create a database user
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/Sona-Social-hub?retryWrites=true&w=majority`

## Step 2: Deploy Backend to Render

### Option A: Using Render Dashboard
1. Go to [Render](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `sona-social-hub-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a long random string (use `openssl rand -base64 32`)
   - `UPLOAD_PATH`: `./uploads`

### Option B: Using render.yaml (Blueprint)
1. Push the `render.yaml` file to your repository
2. In Render, click "New" → "Blueprint"
3. Connect your repository
4. Render will automatically detect and deploy using the blueprint

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_URL`: `https://your-render-app.onrender.com/api`
6. Update `vercel.json`:
   - Replace `your-render-app.onrender.com` with your actual Render app URL

## Step 4: Update API URLs

After deployment, update these files with your actual URLs:

### Frontend (vercel.json)
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://YOUR-RENDER-APP.onrender.com/api/$1"
    },
    {
      "src": "/uploads/(.*)",
      "dest": "https://YOUR-RENDER-APP.onrender.com/uploads/$1"
    }
  ],
  "env": {
    "VITE_API_URL": "https://YOUR-RENDER-APP.onrender.com/api"
  }
}
```

## Step 5: Seed Initial Data

After backend deployment:

1. Go to your Render app logs
2. Run the seed command:
   ```bash
   npm run seed
   ```
3. This creates the admin user: `admin@sonatech.ac.in` / `admin123`

## Step 6: Domain Configuration (Optional)

### Custom Domain for Frontend
1. In Vercel dashboard, go to your project settings
2. Add your custom domain
3. Configure DNS records as instructed

### Custom Domain for Backend
1. In Render dashboard, go to your service settings
2. Add custom domain
3. Configure DNS records

## Step 7: Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-long-random-secret
UPLOAD_PATH=./uploads
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-render-app.onrender.com/api
```

## Step 8: Testing Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend API**: Test `https://your-render-app.onrender.com/api/auth/me`
3. **Admin Login**: Use `admin@sonatech.ac.in` / `admin123`

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure backend CORS is configured correctly
2. **Upload Issues**: Check that uploads directory exists and is writable
3. **Database Connection**: Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
4. **Environment Variables**: Double-check all env vars are set correctly

### Logs:
- **Render**: Check service logs in Render dashboard
- **Vercel**: Check deployment logs in Vercel dashboard

## Security Notes

1. **JWT Secret**: Use a long, random string in production
2. **MongoDB**: Enable authentication and restrict IP access
3. **Environment Variables**: Never commit secrets to repository
4. **HTTPS**: All services should use HTTPS in production

## Alternative Deployment Options

### Backend Alternatives:
- **Railway**: Similar to Render
- **Heroku**: Traditional PaaS
- **AWS/DigitalOcean**: VPS with Docker

### Frontend Alternatives:
- **Netlify**: Similar to Vercel
- **GitHub Pages**: For static sites (requires build modifications)

### Database Alternatives:
- **MongoDB Atlas** (recommended)
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)
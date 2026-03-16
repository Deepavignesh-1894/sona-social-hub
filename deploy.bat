@echo off
REM Sona Social Hub - Quick Deployment Script (Windows)
REM This script helps with initial deployment setup

echo 🚀 Sona Social Hub Deployment Helper
echo ====================================
echo.

REM Check if required tools are installed
echo 📋 Checking prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Build frontend
echo 🔨 Building frontend...
cd frontend
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    cd ..
    pause
    exit /b 1
)
echo ✅ Frontend built successfully
cd ..
echo.

REM Check backend dependencies
echo 🔍 Checking backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependencies installation failed
    cd ..
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..
echo.

echo 🎯 Deployment Checklist:
echo ========================
echo.
echo 1. 🌐 MongoDB Atlas:
echo    - Create cluster at https://mongodb.com/atlas
echo    - Get connection string
echo    - Add to backend/.env.production
echo.
echo 2. 🚀 Render ^(Backend^):
echo    - Go to https://render.com
echo    - New → Web Service
echo    - Connect GitHub repo
echo    - Set environment variables:
echo      * NODE_ENV=production
echo      * PORT=10000
echo      * MONGODB_URI=^<your-mongo-uri^>
echo      * JWT_SECRET=^<long-random-string^>
echo      * UPLOAD_PATH=./uploads
echo.
echo 3. ⚡ Vercel ^(Frontend^):
echo    - Go to https://vercel.com
echo    - New Project
echo    - Import GitHub repo
echo    - Set root directory: frontend
echo    - Set VITE_API_URL to your Render backend URL
echo.
echo 4. 🔧 Update URLs:
echo    - Update frontend/vercel.json with your Render app URL
echo    - Update frontend/src/api.js if needed
echo.
echo 5. 🌱 Seed Database:
echo    - After backend deployment, run: npm run seed
echo    - Admin login: admin@sonatech.ac.in / admin123
echo.
echo 📚 For detailed instructions, see DEPLOYMENT.md
echo.
echo 🎉 Ready for deployment!

pause
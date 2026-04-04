# Production Deployment Guide - Render + Vercel + MongoDB Atlas

## 🎯 Overview

Your stack:
- **Backend**: Node.js + Express (Render)
- **Frontend**: React + Vite (Vercel)
- **Database**: MongoDB Atlas (existing)
- **Email**: Gmail SMTP

---

## 📋 Pre-Deployment Checklist

- [x] Backend code complete
- [x] Frontend code complete
- [x] Email service configured
- [x] Admin features implemented
- [x] Database fields ready (Mongoose auto-migration)
- [ ] **Production environment variables set**
- [ ] **Code pushed to GitHub**
- [ ] **Testing completed**

---

## 🚀 Step 1: Deploy Backend to Render

### 1.1 Connect GitHub Repository (if not already done)
1. Go to [render.com](https://render.com)
2. Login with GitHub
3. New → Web Service
4. Select your repository branch
5. Auto-detect settings

### 1.2 Update Environment Variables
1. In Render dashboard → Environment
2. Click "Add Environment Variable" for each:

```yaml
PORT=5000
MONGODB_URI=mongodb+srv://rockybhai1894_db_user:r7NSuuRXOdsp2LfY@cluster0.ii7lac0.mongodb.net/sona_social_hub_final?retryWrites=true&w=majority
JWT_SECRET=myjwtsecret123
UPLOAD_PATH=./uploads
EMAIL_USER=deepavigneshvictus@gmail.com
EMAIL_PASSWORD=Deepa1894.
FRONTEND_URL=https://YOUR-VERCEL-FRONTEND-URL.com
```

**Important**: Replace `YOUR-VERCEL-FRONTEND-URL` with your actual Vercel domain!

### 1.3 Deploy
1. Make sure you've pushed latest code to GitHub
2. Render auto-detects changes
3. Click "Manual Deploy" if needed
4. Wait for deployment (usually 2-5 minutes)
5. Check build logs for errors

### 1.4 Verify Backend
After deployment:
- Note your backend URL (e.g., `https://sona-hub-backend.onrender.com`)
- Test endpoint: `https://sona-hub-backend.onrender.com/api/health`
- Should return `{"ok":true}`

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Connect GitHub (if not already done)
1. Go to [vercel.com](https://vercel.com)
2. "Import Project"
3. Select your GitHub repository
4. Select `frontend` folder as root

### 2.2 Update Environment Variables
1. In Vercel dashboard → Settings → Environment Variables
2. Add or update:

```
VITE_API_URL=https://YOUR-RENDER-BACKEND-URL/api
```

**Important**: Replace with your actual Render backend URL!

Example:
```
VITE_API_URL=https://sona-hub-backend.onrender.com/api
```

### 2.3 Deploy
1. Vercel auto-deploys on push
2. Or click "Redeploy" in dashboard
3. Wait for build (usually 2-3 minutes)
4. Check build logs

### 2.4 Verify Frontend
- Note your frontend URL (e.g., `https://sona-hub-frontend.vercel.app`)
- Visit the URL
- Should load app successfully

---

## 🔄 Step 3: Cross-Connect Services

### 3.1 Update Backend FRONTEND_URL
After you have the Vercel URL:

1. **Local first** (test):
   - Set `FRONTEND_URL=http://localhost:5173` in `.env`
   - Test locally

2. **Then update in Render**:
   - Go to Render dashboard
   - Update `FRONTEND_URL` to your Vercel URL
   - Trigger redeploy

### 3.2 Update Frontend VITE_API_URL
After you have the Render URL:

1. In Vercel dashboard
2. Settings → Environment Variables
3. Set `VITE_API_URL=https://YOUR-RENDER-URL/api`
4. Redeploy

---

## 📧 Gmail SMTP Security Note

Currently using:
```
EMAIL_USER=deepavigneshvictus@gmail.com
EMAIL_PASSWORD=Deepa1894.
```

This works but Google may block "Less Secure Apps". If you get authentication errors in production:

### Use Gmail App Password (Recommended)
1. Enable 2FA on Gmail account
2. Go to [myaccount.google.com → Security](https://myaccount.google.com/security)
3. Find "App passwords"
4. Generate for Mail → Windows Computer
5. Copy 16-character password
6. Update Render environment:
   ```
   EMAIL_PASSWORD=your-16-char-app-password
   ```
7. Redeploy

---

## ✅ Production Testing

### Test 1: User Registration + Email Verification
```
1. Go to frontend URL → Register
2. Enter: test@sonatech.ac.in + password
3. Check Gmail spam/inbox for email
4. Click verification link
5. Should verify successfully
```

### Test 2: Forgot Password
```
1. Go to Login page → "Forgot password?"
2. Enter email
3. Check Gmail for reset email
4. Click reset link
5. Set new password
6. Login with new password
```

### Test 3: Admin Dashboard
```
1. Login as admin
2. Go to /app/admin
3. Should see stats dashboard
4. Click "Manage Users" → test user management
```

### Test 4: Email Verification Banner
```
1. Create new user (before verifying email)
2. Should see yellow banner
3. Click "Resend Verification"
4. Should send email
```

---

## 🔍 Monitoring

### Render Backend Logs
1. Render dashboard → Logs
2. Watch for errors
3. Check email sending logs

### Vercel Frontend Logs
1. Vercel dashboard → Analytics
2. Monitor errors
3. Check console errors

### MongoDB Atlas
1. Go to [atlas.mongodb.com](https://atlas.mongodb.com)
2. Your cluster → Activity
3. Monitor connection count
4. Check for errors

---

## 🆘 Troubleshooting

### Backend Deploy Fails
- Check build logs in Render
- Ensure all dependencies installed locally
- Verify MongoDB URI is correct
- Check for syntax errors

### Frontend Deploy Fails
- Check build logs in Vercel
- Verify all imports are correct
- Check for TypeScript errors
- Ensure `VITE_API_URL` is set

### Email Not Sending in Production
- Check EMAIL_USER and EMAIL_PASSWORD are correct
- Try using App Password instead
- Check Gmail security settings
- Look at backend logs for email errors

### "Cannot connect to API"
- Check VITE_API_URL is set correctly in Vercel
- Check FRONTEND_URL in Render
- Ensure backend is deployed and running
- Test `/api/health` endpoint directly

### Verification Email Link Doesn't Work
- Check FRONTEND_URL in Render backend
- Should match your Vercel domain exactly
- Include `https://` not just domain

---

## 📊 Deployment Summary

After following these steps, you'll have:

```
✅ Backend deployed to Render (auto-deploy from GitHub)
✅ Frontend deployed to Vercel (auto-deploy from GitHub)
✅ Database connected (MongoDB Atlas - existing)
✅ Email service working (Nodemailer + Gmail)
✅ Admin features live
✅ Email verification live
✅ Password reset live
```

**Total deployment time**: ~15-20 minutes

---

## 🔄 Future Updates

To deploy future updates:

1. **Make changes locally**
2. **Test locally** (`npm run dev` on backend + frontend)
3. **Push to GitHub**
4. **Render auto-deploys** backend (watch logs)
5. **Vercel auto-deploys** frontend (watch build)
6. **Test in production**

---

## 📞 Quick Reference

| Service | URL | Component |
|---------|-----|-----------|
| Backend Render | https://sona-hub-backend.onrender.com | Node.js API |
| Frontend Vercel | https://sona-hub-frontend.vercel.app | React App |
| Database | MongoDB Atlas | User + Content Data |
| Health Check | `/api/health` | Backend status |

---

## ✨ Features Live in Production

✅ Email verification with secure tokens  
✅ Forgot password with reset link  
✅ Email verification banner for unverified users  
✅ Admin user management dashboard  
✅ Admin can delete users/posts/groups  
✅ Admin can change user roles  
✅ Admin can verify emails manually  
✅ Admin can ban/unban users  
✅ Admin can view detailed statistics  
✅ Admin can manage reports  

---

**Deployment Complete! 🎉**

All features ready for production use on Render + Vercel + MongoDB Atlas.

Last Updated: March 17, 2026

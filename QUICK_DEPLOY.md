# 🚀 QUICK START - Production Deployment

## Current Setup
- **Local Backend**: http://localhost:5000 ✅
- **Local Frontend**: http://localhost:5173 ✅
- **Gmail Email**: Configured ✅
- **MongoDB**: Connected ✅

---

## For Render Backend

**Step 1**: Update `.env` in Render dashboard:
```
FRONTEND_URL=https://YOUR-VERCEL-URL.com
```

**Step 2**: Push to GitHub → Render auto-deploys

**Step 3**: Get your Render URL (e.g., `sona-hub.onrender.com`)

---

## For Vercel Frontend

**Step 1**: In Vercel dashboard → Environment Variables:
```
VITE_API_URL=https://YOUR-RENDER-URL/api
```

**Step 2**: Push to GitHub → Vercel auto-deploys

---

## Test Production

1. **Register** at your-frontend-url/register
2. **Check Gmail** for verification email
3. **Try Forgot Password** at your-frontend-url/login
4. **Login as Admin** and test /app/admin/users

---

## Environment Variables

### Render (Backend) .env
```
PORT=5000
MONGODB_URI=mongodb+srv://rockybhai1894_db_user:r7NSuuRXOdsp2LfY@cluster0.ii7lac0.mongodb.net/sona_social_hub_final?retryWrites=true&w=majority
JWT_SECRET=myjwtsecret123
UPLOAD_PATH=./uploads
EMAIL_USER=deepavigneshvictus@gmail.com
EMAIL_PASSWORD=Deepa1894.
FRONTEND_URL=https://your-vercel-domain.com
```

### Vercel (Frontend) Variables
```
VITE_API_URL=https://your-render-domain.onrender.com/api
```

---

## Feature Checklist

- [x] Email verification
- [x] Forgot password
- [x] Admin user management
- [x] Admin delete users
- [x] Admin change roles
- [x] Admin verify emails
- [x] Admin ban users
- [x] View user stats

---

## If Email Doesn't Work

1. Check EMAIL_USER and EMAIL_PASSWORD in Render
2. Try using Gmail App Password instead
3. Enable "Less secure apps" in Gmail settings
4. Check backend logs in Render for errors

---

## MongoDB Auto-Migration

✅ New fields added automatically:
- emailVerified
- verificationToken
- verificationExpires
- passwordResetToken
- passwordResetExpires

**No manual migration needed!**

---

## Support

Full guides available:
- 📄 `DEPLOYMENT_TEST_GUIDE.md` - Testing instructions
- 📄 `PRODUCTION_DEPLOYMENT.md` - Detailed deployment
- 📄 `EMAIL_VERIFICATION_SETUP.md` - Email setup help

---

**Time to Deploy**: 15-20 minutes
**Difficulty**: Easy (mostly environment variables)

# 🚀 Deployment & Testing Guide

## ✅ Current Status

- **Backend**: Running on `http://localhost:5000` ✅
- **Frontend**: Running on `http://localhost:5173` ✅
- **Database**: MongoDB Atlas (existing) ✅
- **Email Service**: Nodemailer + Gmail SMTP configured ✅

---

## 🧪 Quick Testing (Local)

### Test 1: Email Verification Flow
1. Open `http://localhost:5173/register`
2. Register with `test@sonatech.ac.in`
3. **Check Gmail inbox** for verification email
4. Click the verification link in the email
5. Should redirect to feed with success message

### Test 2: Forgot Password Flow
1. Go to `http://localhost:5173/login`
2. Click "Forgot password?" link
3. Enter your email
4. **Check Gmail inbox** for reset email
5. Click reset link and set new password

### Test 3: Admin Controls
1. Login as admin user (if you have one)
2. Navigate to `/app/admin/users`
3. Try to:
   - Search users
   - Change user roles
   - Verify emails
   - Ban users
   - Delete users (non-admin only)

### Test 4: Email Verification Banner
1. Login as unverified user
2. You should see yellow banner at top of feed
3. Click "Resend Verification" button
4. Should trigger email send

---

## 📦 Deployment Checklist

### For **Render Backend** (Existing)

1. **Update Environment Variables** in Render dashboard:
   ```
   PORT=5000
   MONGODB_URI=[your existing MongoDB URI]
   JWT_SECRET=[your secret]
   UPLOAD_PATH=./uploads
   EMAIL_USER=deepavigneshvictus@gmail.com
   EMAIL_PASSWORD=Deepa1894.
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

2. **Redeploy**:
   - Push changes to GitHub
   - Render will auto-deploy
   - Or use "Deploy" button in Render dashboard

3. **Verify**:
   - Check `/api/health` endpoint
   - Test admin endpoints
   - Monitor email sending in logs

### For **Vercel Frontend** (Existing)

1. **Update Environment Variables** in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-domain.onrender.com/api
   ```

2. **Redeploy**:
   - Push to GitHub
   - Vercel auto-deploys
   - Or use "Redeploy" in Vercel dashboard

3. **Verify**:
   - Test login/register
   - Check email verification works
   - Test admin features

### For **MongoDB Atlas** (No changes needed)
- Your existing MongoDB URI remains the same
- All new fields (`emailVerified`, `verificationToken`, etc.) are auto-created by Mongoose

---

## 🔑 Gmail SMTP Setup Notes

Your `.env` currently has:
```
EMAIL_USER=deepavigneshvictus@gmail.com
EMAIL_PASSWORD=Deepa1894.
```

**⚠️ Optional: Use App Password instead** (More Secure)
If you encounter "Invalid Credentials" errors:

1. Enable 2FA on Gmail: [myaccount.google.com/security](https://myaccount.google.com/security)
2. Generate App Password:
   - Search for "App passwords"
   - Select Mail → Windows → Generate
   - Copy 16-character password
   - Update EMAIL_PASSWORD to this

Then redeploy to Render.

---

## 🗄️ Database Migrations (Auto-Handled)

These fields are **automatically added** to existing User documents:
- `emailVerified` (Boolean, default: false)
- `verificationToken` (String, default: null)
- `verificationExpires` (Date, default: null)
- `passwordResetToken` (String, default: null)
- `passwordResetExpires` (Date, default: null)

✅ **No manual migration needed** - Mongoose handles this

---

## 📱 Testing Edge Cases

### Test Email Sending Error Handling
1. Temporarily change `EMAIL_USER` to invalid email
2. Try to register
3. Should show: "Registration successful" but note about verification email
4. User can still access app, just with banner reminder

### Test Existing Users
1. Login with email that registered before this update
2. Should see yellow verification banner
3. Click "Resend Verification" - should send email
4. Can click link to verify

### Test Admin Deletion
1. Create test user
2. As admin, go to `/app/admin/users`
3. Delete test user
4. User and ALL posts/comments/messages deleted
5. Verify in database (optional)

### Test Token Expiration
1. Get verification token from sent email
2. Wait 24+ hours (or test with old token)
3. Try to verify - should show "expired token" error

---

## 🐛 Troubleshooting

### "Failed to send verification email"
- **Check**: EMAIL_USER and EMAIL_PASSWORD in `.env`
- **Check**: Gmail 2FA enabled
- **Try**: Use App Password instead of plain password
- **Check logs**: Backend console should show email error

### Server won't start: "EADDRINUSE"
- Port 5000 already in use
- Kill process: `npx kill-port 5000`
- Or change PORT in `.env`

### Verification link doesn't work
- Check FRONTEND_URL in `.env` 
- Should be `http://localhost:5173` for local
- Should be `https://your-vercel-domain.com` for production

### Admin endpoints 403 Forbidden
- Verify user has role `"admin"`
- Check in MongoDB: `db.users.findOne({email: "admin@sonatech.ac.in"}).role`
- Update role manually if needed

---

## 🚀 Production Deployment Steps

### Step 1: Test Locally
- [ ] Backend running on 5000
- [ ] Frontend running on 5173
- [ ] Register and verify email works
- [ ] Forgot password email works
- [ ] Admin dashboard loads
- [ ] Admin can manage users

### Step 2: Deploy Backend to Render
- [ ] Push to GitHub
- [ ] Render auto-deploys
- [ ] Check logs for errors
- [ ] Test `/api/health` from production URL

### Step 3: Deploy Frontend to Vercel
- [ ] Set `VITE_API_URL` to your Render backend URL
- [ ] Push to GitHub
- [ ] Vercel auto-deploys
- [ ] Test in production

### Step 4: Verify Production
- [ ] Register new user
- [ ] Check Gmail for email
- [ ] Test forgot password
- [ ] Login and access admin panel
- [ ] Monitor for errors

### Step 5: Monitor (First 24 Hours)
- [ ] Check backend logs in Render
- [ ] Check frontend errors in Vercel
- [ ] Monitor email sending success rate
- [ ] Check admin features work

---

## 📊 New API Endpoints Summary

### Auth Endpoints
```
POST   /api/auth/verify-email              ← Email verification
POST   /api/auth/resend-verification       ← Resend email (auth required)
POST   /api/auth/forgot-password           ← Password reset request
POST   /api/auth/reset-password            ← Reset password with token
```

### Admin Endpoints (All require admin role)
```
DELETE /api/admin/user/:id                 ← Delete user + content
PATCH  /api/admin/user/:id/role            ← Change user role
PATCH  /api/admin/user/:id/verify-email    ← Force verify email
DELETE /api/admin/post/:id                 ← Delete post
DELETE /api/admin/comment/:id              ← Delete comment
DELETE /api/admin/group/:id                ← Delete group
GET    /api/admin/users-unverified         ← Get unverified users
GET    /api/admin/users?page=1&limit=50    ← Get all users (paginated)
GET    /api/admin/stats                    ← Get analytics
PATCH  /api/admin/approve-official/:id     ← Approve official
PATCH  /api/admin/reject-official/:id      ← Revoke official status
GET    /api/admin/reports?status=all       ← Get reports
PATCH  /api/admin/report/:id               ← Handle report
```

---

## 🎯 Next Steps

1. **Test locally** (follow Testing section above)
2. **Update Render environment variables**
3. **Update Vercel environment variables**
4. **Redeploy both services**
5. **Test production environment**
6. **Monitor logs for first 24 hours**

---

**All systems ready for production deployment! 🎉**

Date: March 17, 2026

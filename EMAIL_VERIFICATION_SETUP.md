# Sona Social Hub - Email Verification & Enhanced Admin Setup Guide

## 🎉 New Features Implemented

### 1. **Email Verification System**
- All new users must verify their email address on registration
- Users receive a verification email with a secure token link
- Existing users get a banner prompting them to verify with a "Resend Verification" button
- Verified emails display a checkmark on user profiles

### 2. **Forgot Password Feature**
- Login page now has a "Forgot password?" link
- Users can request password reset by entering their email
- Secure reset link sent via email with 1-hour expiration
- Users can set a new password after verification

### 3. **Powerful Admin Controls**
Admin users can now:
- ✅ **View & Manage Users**: Search, filter, change roles, verify emails manually
- ✅ **Delete Users & Content**: Remove users and all associated posts/comments/messages
- ✅ **Change User Roles**: Convert students to officials or admins
- ✅ **Ban/Unban Users**: Prevent banned users from accessing the platform
- ✅ **Verify Emails Manually**: Force verify user emails
- ✅ **Delete Posts & Comments**: Remove inappropriate content
- ✅ **Delete Groups**: Remove groups and associated content
- ✅ **View Reports**: See reported content and take action
- ✅ **Analytics Dashboard**: View detailed statistics on users, content, and engagement

### 4. **UI Components Added**
- `VerifyEmail.jsx` - Email verification page
- `ForgotPassword.jsx` - Forgot password request page
- `ResetPassword.jsx` - Password reset page
- `EmailVerificationBanner.jsx` - Verification reminder banner
- `AdminUsers.jsx` - Powerful user management interface

---

## 🔧 SETUP INSTRUCTIONS

### Step 1: Gmail Setup (Email Service)

You need to set up Gmail SMTP to send emails. Follow these steps:

#### Option A: Using Gmail App Password (RECOMMENDED)
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in the left menu
3. Enable **2-Step Verification** if not already enabled
4. Scroll down and click **App passwords** (appears after 2FA is enabled)
5. Select **Mail** and **Windows Computer**
6. Copy the generated 16-character password
7. Update `.env` file:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   FRONTEND_URL=http://localhost:5173
   ```

#### Option B: Using Gmail Password Directly (Less Secure)
If you can't use App Passwords:
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable "Less secure app access"
3. Use your Gmail password in `.env`:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-actual-gmail-password
   FRONTEND_URL=http://localhost:5173
   ```

**Note for College Email**: If Sona Social Hub uses your college's Gmail system:
- Contact your IT department for SMTP credentials
- Use similar setup with your college email

### Step 2: Environment Variables

Update `backend/.env`:
```env
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret
UPLOAD_PATH=./uploads
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

For production on Render/Vercel, update environment variables in the platform's dashboard.

### Step 3: Test Email Service (Optional)

Create a test file `backend/test-email.js`:
```javascript
import { sendVerificationEmail, sendPasswordResetEmail } from './config/emailService.js';

// Test verification email
await sendVerificationEmail('test@sonatech.ac.in', 'test-token-123');
console.log('Verification email sent!');

// Test reset email
await sendPasswordResetEmail('test@sonatech.ac.in', 'reset-token-456');
console.log('Reset email sent!');
```

Run: `node test-email.js`

### Step 4: Restart Backend

```bash
cd backend
npm run dev
```

---

## 📱 Frontend URLs (Post-Setup)

### For Users:
- **Email Verification**: `http://localhost:5173/verify-email?token=XXX`
- **Forgot Password**: `http://localhost:5173/forgot-password`
- **Reset Password**: `http://localhost:5173/reset-password?token=XXX`

### For Admins:
- **Admin Dashboard**: `/app/admin`
- **User Management**: `/app/admin/users`
- **Manage Posts**: `/app/admin/posts`
- **Manage Groups**: `/app/admin/groups`
- **Handle Reports**: `/app/admin/reports`
- **Approve Officials**: `/app/admin/pending`

---

## 🛡️ Security Features

1. **Email Domain Validation**: Only `@sonatech.ac.in` emails allowed
2. **Secure Tokens**: 32-byte random tokens for verification & reset
3. **Token Expiration**: 
   - Email verification: 24 hours
   - Password reset: 1 hour
4. **Password Hashing**: bcryptjs with 10 salt rounds
5. **JWT Authentication**: 7-day token expiration
6. **Admin-only Endpoints**: All admin routes require admin role

---

## 📊 API Endpoints Added

### Authentication Routes
```
POST   /api/auth/verify-email              - Verify email with token
POST   /api/auth/resend-verification       - Resend verification email (protected)
POST   /api/auth/forgot-password           - Request password reset
POST   /api/auth/reset-password            - Reset password with token
```

### Admin Routes (All require admin role)
```
DELETE /api/admin/user/:id                 - Delete user & all content
PATCH  /api/admin/user/:id/role            - Change user role
PATCH  /api/admin/user/:id/verify-email    - Force verify email
DELETE /api/admin/post/:id                 - Delete post
DELETE /api/admin/comment/:id              - Delete comment
DELETE /api/admin/group/:id                - Delete group
GET    /api/admin/users-unverified         - Get unverified users
GET    /api/admin/users                    - Get all users (paginated)
GET    /api/admin/stats                    - Get analytics
PATCH  /api/admin/approve-official/:id     - Approve official
PATCH  /api/admin/reject-official/:id      - Reject official
GET    /api/admin/reports                  - Get reports
PATCH  /api/admin/report/:id               - Handle report
```

---

## 🚀 Production Deployment

### For Render Backend:
1. Add environment variables in Render dashboard:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-app-password
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. Update `FRONTEND_URL` to your actual frontend domain

### For Vercel Frontend:
1. Update `.env.local` or environment variables:
   ```
   VITE_API_URL=https://your-backend-domain.com/api
   ```

---

## 🐛 Troubleshooting

### "Failed to send verification email"
- Check EMAIL_USER and EMAIL_PASSWORD in `.env`
- Verify Gmail 2FA is enabled
- Check Gmail App Password was created correctly
- Restart backend server

### "Invalid or expired verification token"
- Token expires after 24 hours
- User should click "Resend Verification" button
- Only one token valid per user at a time

### "Password reset link not working"
- Token expires after 1 hour
- User should request a new reset link
- Check FRONTEND_URL is correct in `.env`

### Emails not showing in inbox
- Check Gmail spam folder
- Whitelist noreply@sonatech.ac.in in Gmail settings
- Verify Gmail less secure settings enabled

---

## 📝 Database Migration (Existing Users)

Users who registered before this update:
- ✅ Already have `emailVerified = false`
- ✅ Will see verification banner on first login
- ✅ Can click "Resend Verification" to get email
- ✅ No data loss or forced migration needed

To manually verify an existing user (as admin):
1. Go to `/app/admin/users`
2. Find user in the list
3. Click "Verify" button

---

## ✅ Testing Checklist

- [ ] Backend starts without errors
- [ ] Emails are being sent successfully
- [ ] New user registration triggers verification email
- [ ] Email verification link works
- [ ] Forgot password link works and email received
- [ ] Password reset page works
- [ ] Admin can access user management
- [ ] Admin can delete users
- [ ] Admin can change user roles
- [ ] Admin can verify user emails
- [ ] Email verification banner shows for unverified users
- [ ] Existing users still work properly

---

## 🎓 Support

For issues or questions:
1. Check this guide again
2. Review API endpoint documentation
3. Check browser console for errors (F12)
4. Check backend logs for email errors
5. Verify `.env` configuration

---

**Implementation Date**: March 17, 2026
**All new features ready for production! 🚀**

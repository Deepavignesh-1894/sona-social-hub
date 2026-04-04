# Email Service Fix Guide

## Current Issue
The email verification system is failing because the Gmail app password `fyomvicijxaflboh` is invalid or expired.

## Error Details
- **Error**: "Missing credentials for PLAIN"
- **Cause**: Invalid or expired Gmail app password
- **Impact**: Users cannot receive verification emails during registration

## Solutions

### Option 1: Generate New Gmail App Password (Recommended)

1. **Go to Google Account Security**
   - Visit: https://myaccount.google.com/security
   - Sign in with `rockybhai1894@gmail.com`

2. **Enable 2-Step Verification** (if not already enabled)
   - Click on "2-Step Verification"
   - Follow the setup process
   - This is REQUIRED for app passwords

3. **Generate New App Password**
   - Go back to Security page
   - Click on "App passwords" (appears after 2FA is enabled)
   - Select:
     - App: "Mail"
     - Device: "Windows Computer" or "Other (Custom name)"
   - Click "Generate"
   - Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)

4. **Update Environment Variables**
   ```env
   EMAIL_USER=rockybhai1894@gmail.com
   EMAIL_PASSWORD=your-new-16-char-app-password
   ```

5. **Restart Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

### Option 2: Use Alternative Email Service

If Gmail doesn't work, you can use other email services:

#### SendGrid (Free tier available)
1. Sign up at https://sendgrid.com
2. Get an API key
3. Install: `npm install @sendgrid/mail`
4. Update emailService.js to use SendGrid

#### Mailgun (Free tier available)
1. Sign up at https://mailgun.com
2. Get API credentials
3. Install: `npm install nodemailer-mailgun-transport`

### Option 3: Temporary Development Bypass

For development only, you can bypass email sending:

1. **Comment out email sending in auth.js**:
   ```javascript
   // await sendVerificationEmail(user.email, verificationToken);
   console.log('Email sending bypassed in development');
   ```

2. **Auto-verify users for testing**:
   ```javascript
   user.emailVerified = true; // Remove this in production
   ```

## Testing the Fix

After updating the password:

1. **Test email service**:
   ```bash
   node test-email.js
   ```

2. **Test registration flow**:
   - Start frontend: `cd frontend && npm run dev`
   - Register a new user
   - Check email inbox for verification link

## Current Configuration

```env
EMAIL_USER=rockybhai1894@gmail.com
EMAIL_PASSWORD=fyomvicijxaflboh  # ← NEEDS UPDATE
FRONTEND_URL=http://localhost:5173
```

## Security Notes

- Never commit actual passwords to Git
- Use app passwords, not regular Gmail passwords
- Consider using environment-specific .env files
- For production, use a dedicated email service like SendGrid

## Next Steps

1. Generate new app password
2. Update .env file
3. Restart backend server
4. Test with test-email.js
5. Test full registration flow
6. Remove test-email.js after testing

---

**Priority**: HIGH - Email verification is critical for user onboarding
**Estimated Time**: 10-15 minutes to fix with new app password

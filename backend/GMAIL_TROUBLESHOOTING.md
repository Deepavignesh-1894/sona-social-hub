# Gmail App Password Troubleshooting Guide

## Current Issue
The Gmail app password `cggehhwoinbmhcyf` is not working with SMTP authentication.

## Possible Causes & Solutions

### 1. **App Password Not Generated Correctly**
**Symptoms**: "Missing credentials for PLAIN" error
**Solution**:
1. Go to https://myaccount.google.com/apppasswords
2. Make sure you're signed into `rockybhai1894@gmail.com`
3. Select "Mail" as the app
4. Select "Windows Computer" as the device
5. Click "Generate"
6. Copy the 16-character password exactly (including spaces)
7. Format: `xxxx xxxx xxxx xxxx` (with spaces)

### 2. **2-Step Verification Not Enabled**
**Symptoms**: App passwords section not available
**Solution**:
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Wait a few minutes
4. Try generating app password again

### 3. **Less Secure Apps Access**
**Symptoms**: Authentication failures even with correct password
**Solution**:
1. Go to https://myaccount.google.com/lesssecureapps
2. Enable "Allow less secure apps"
3. Try again (this is a fallback option)

### 4. **Gmail Account Locked/Restricted**
**Symptoms**: Sudden authentication failures
**Solution**:
1. Check if Google sent any security emails
2. Verify recent login attempts
3. May need to unlock account at https://accounts.google.com/b/0/DisplayUnlockCaptcha

### 5. **App Password Expired/Revoked**
**Symptoms**: Previously working password suddenly fails
**Solution**:
1. Go to https://myaccount.google.com/apppasswords
2. Find "sona-social-hub" in the list
3. Click "Remove" next to it
4. Generate a new app password
5. Update .env file immediately

## Testing App Password

### Method 1: Direct SMTP Test
```bash
# Create test file
node -e "
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'rockybhai1894@gmail.com',
    pass: 'cggehhwoinbmhcyf'
  }
});
transporter.verify().then(console.log).catch(console.error);
"
```

### Method 2: Telnet Test
```bash
# Test SMTP connection
telnet smtp.gmail.com 465
```

## Immediate Workaround

While fixing Gmail issues, use the development bypass:

1. Switch to development email service:
```javascript
// In routes/auth.js
import { sendVerificationEmail } from '../config/emailServiceDev.js';
```

2. Check backend console for verification links
3. Copy-paste links manually for testing

## Production Email Services (Alternatives)

If Gmail continues to fail:

### SendGrid (Recommended)
1. Sign up: https://sendgrid.com
2. Get free API key (100 emails/day)
3. Install: `npm install @sendgrid/mail`
4. Configure emailService.js

### Mailgun
1. Sign up: https://mailgun.com
2. Get free tier (5000 emails/month)
3. Install: `npm install nodemailer-mailgun-transport`

### AWS SES
1. Sign up: https://aws.amazon.com/ses
2. Very reliable, pay-per-use
3. More complex setup

## Security Best Practices

1. **Never commit passwords to Git**
2. **Use environment-specific .env files**
3. **Rotate app passwords every 90 days**
4. **Monitor Google account security**
5. **Use dedicated email for production**

## Current Status

- ✅ Backend code is correct
- ✅ Environment variables configured
- ❌ Gmail app password authentication failing
- ✅ Development bypass working

## Next Steps

1. Follow troubleshooting steps above
2. Generate new app password if needed
3. Test with new password
4. Switch back to production email service
5. Monitor for future issues

---

**Priority**: HIGH - Email verification is critical
**Timeline**: 30 minutes to fix Gmail, 2 hours for alternative service

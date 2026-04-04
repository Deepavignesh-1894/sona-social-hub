# Gmail App Password Maintenance Guide

## How to Prevent App Password Expiration & Issues

### 🔐 **Understanding App Passwords**

Gmail app passwords **don't technically expire**, but they can stop working due to:
- Account security changes
- 2FA settings modifications
- Google policy updates
- Suspicious activity detection

### 📋 **Preventive Maintenance Schedule**

#### **Monthly Checklist** (5 minutes)
1. **Check App Password Status**
   - Visit: https://myaccount.google.com/apppasswords
   - Verify "sona-social-hub" is still listed
   - Look for any warnings or revocations

2. **Test Email Functionality**
   ```bash
   cd backend
   node test-email.js
   ```
   - Should show "✅ Verification email sent successfully"
   - If fails, regenerate password immediately

#### **Quarterly Deep Check** (15 minutes)
1. **Review Google Security**
   - Check: https://myaccount.google.com/security
   - Review recent security events
   - Verify 2FA is active
   - Check for any account warnings

2. **Rotate App Password** (Recommended)
   - Remove old "sona-social-hub" password
   - Generate new app password
   - Update .env file
   - Restart backend server

### 🛡️ **Security Best Practices**

#### **Account Security**
1. **Enable 2-Step Verification** (Mandatory)
   - SMS + Authenticator App
   - Backup codes stored securely
   - Security key (optional but recommended)

2. **Monitor Account Activity**
   - Check: https://myaccount.google.com/activity
   - Review unfamiliar login attempts
   - Set up security alerts

3. **Use Dedicated Email** (Production)
   - Create separate Gmail: `noreply@sonatech.ac.in`
   - Or use domain email with Google Workspace
   - Keeps personal account separate

#### **Password Management**
1. **Secure Storage**
   ```env
   # .env (never commit to Git)
   EMAIL_USER=rockybhai1894@gmail.com
   EMAIL_PASSWORD=cggehhwoinbmhcyf
   ```

2. **Environment-Specific Configs**
   ```bash
   # Development
   .env.local  # Local testing
   
   # Staging  
   .env.staging # Staging environment
   
   # Production
   .env.production # Live server
   ```

3. **Backup Procedures**
   - Store app passwords in secure password manager
   - Document regeneration process
   - Have backup email service ready

### 🚨 **Warning Signs & Solutions**

#### **Early Warning Signs**
- Emails stop sending suddenly
- "Missing credentials for PLAIN" errors
- Authentication failures in logs
- Google security emails received

#### **Immediate Actions**
1. **Check App Password Status**
   - Visit app passwords page
   - Look for revoked passwords

2. **Verify Account Security**
   - Check for security alerts
   - Review recent activity

3. **Regenerate if Needed**
   - Remove old app password
   - Create new one immediately
   - Update all environments

### 🔄 **App Password Regeneration Process**

#### **Step-by-Step Guide**
1. **Go to App Passwords**
   - URL: https://myaccount.google.com/apppasswords
   - Sign into `rockybhai1894@gmail.com`

2. **Remove Old Password**
   - Find "sona-social-hub" in list
   - Click "Remove" or "Revoke"

3. **Generate New Password**
   - Select app: "Mail"
   - Select device: "Windows Computer"
   - Click "Generate"
   - Copy 16-character password immediately

4. **Update Configuration**
   ```bash
   # Update .env file
   EMAIL_PASSWORD=new-16-char-password
   
   # Restart backend
   npm run dev
   ```

5. **Test New Password**
   ```bash
   node test-email.js
   ```

### 📧 **Alternative Email Services** (Backup Plan)

#### **If Gmail Continues to Fail**
1. **SendGrid** (Recommended)
   - Free: 100 emails/day
   - Reliable delivery
   - Easy setup

2. **Mailgun**
   - Free: 5,000 emails/month
   - Advanced analytics
   - Good for scale

3. **AWS SES**
   - Pay-per-use ($0.10/1000 emails)
   - Very reliable
   - AWS integration

#### **Quick Switch to SendGrid**
```bash
# Install
npm install @sendgrid/mail

# Update emailService.js
import sendGrid from '@sendgrid/mail';
sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
```

### 📊 **Monitoring & Alerts**

#### **Log Monitoring**
```javascript
// Add to email service
if (error.code === 'EAUTH') {
  // Send alert to admin
  console.log('🚨 EMAIL SERVICE DOWN - Check Gmail credentials');
}
```

#### **Health Check Endpoint**
```javascript
// Add to routes
router.get('/health/email', async (req, res) => {
  try {
    await transporter.verify();
    res.json({ status: 'ok', service: 'gmail' });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      service: 'development-bypass',
      message: error.message 
    });
  }
});
```

### 🎯 **Production Deployment Checklist**

#### **Before Going Live**
- [ ] Generate new app password
- [ ] Test email sending
- [ ] Set up monitoring alerts
- [ ] Document backup email service
- [ ] Create maintenance schedule
- [ ] Train team on regeneration process

#### **Ongoing Maintenance**
- [ ] Monthly email tests
- [ ] Quarterly password rotation
- [ ] Security review
- [ ] Update documentation

### 📞 **Emergency Contacts**

#### **If All Email Fails**
1. **Immediate**: Switch to development bypass
2. **Short-term**: Set up SendGrid account
3. **Long-term**: Contact Google Workspace support

#### **Google Support Resources**
- Gmail Help: https://support.google.com/mail
- App Passwords: https://support.google.com/accounts/answer/185833
- 2-Step Verification: https://support.google.com/accounts/answer/185839

---

## 📋 **Quick Reference**

**App Password**: `cggehhwoinbmhcyf` (for "sona-social-hub")
**Email**: `rockybhai1894@gmail.com`
**Test Command**: `node test-email.js`
**App Passwords URL**: https://myaccount.google.com/apppasswords

**Next Maintenance**: Check monthly, rotate quarterly
**Emergency Fallback**: Development bypass (already configured)

---

**Priority**: MEDIUM - Important for long-term stability
**Timeline**: Ongoing maintenance required

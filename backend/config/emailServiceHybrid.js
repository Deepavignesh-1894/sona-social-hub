import nodemailer from 'nodemailer';

// Smart hybrid email service that tries Gmail first, then falls back to development mode
const isDevelopment = process.env.NODE_ENV !== 'production';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Production Gmail transporter
const gmailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: false, // Reduce spam in logs
  logger: false,
  connectionTimeout: 30000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
});

// Development mock transporter
const devTransporter = {
  verify: async () => true,
  sendMail: async (mailOptions) => {
    console.log('\n🔧 Gmail failed - Using development email bypass');
    console.log('📧 To:', mailOptions.to);
    console.log('📋 Subject:', mailOptions.subject);
    
    // Extract verification link from HTML
    const linkMatch = mailOptions.html.match(/href="([^"]+)"/);
    const link = linkMatch ? linkMatch[1] : 'No link found';
    
    console.log('🔗 Link:', link);
    console.log('🔧 End development bypass\n');
    
    return { 
      messageId: 'dev-bypass-' + Date.now(),
      accepted: [mailOptions.to],
      rejected: []
    };
  }
};

// Test Gmail connectivity
let gmailWorking = false;
let lastGmailTest = 0;
const TEST_INTERVAL = 5 * 60 * 1000; // Test every 5 minutes

async function testGmailConnectivity() {
  const now = Date.now();
  if (now - lastGmailTest < TEST_INTERVAL) {
    return gmailWorking;
  }
  
  lastGmailTest = now;
  
  try {
    console.log('🔍 Testing Gmail connectivity...');
    await gmailTransporter.verify();
    gmailWorking = true;
    console.log('✅ Gmail is working');
    return true;
  } catch (error) {
    gmailWorking = false;
    console.log('❌ Gmail failed:', error.message);
    console.log('🔧 Falling back to development mode');
    return false;
  }
}

/**
 * Smart email sender that tries Gmail first, then development mode
 */
async function sendEmailSmart(mailOptions, emailType) {
  const isGmailWorking = await testGmailConnectivity();
  
  if (isGmailWorking && !isDevelopment) {
    try {
      const result = await gmailTransporter.sendMail(mailOptions);
      console.log(`✅ ${emailType} sent via Gmail to ${mailOptions.to}`);
      return { success: true, method: 'gmail', result };
    } catch (error) {
      console.log(`❌ Gmail sending failed: ${error.message}`);
      gmailWorking = false; // Mark as failed for next test
      // Fall through to development mode
    }
  }
  
  // Development fallback
  const result = await devTransporter.sendMail(mailOptions);
  console.log(`🔧 ${emailType} sent via development bypass`);
  return { success: true, method: 'development', result };
}

/**
 * Send verification email to user
 * @param {string} email - User email
 * @param {string} token - Verification token
 */
export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Sona Social Hub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email Verification - Sona Social Hub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 20px;">Welcome to Sona Social Hub!</h1>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for registering! Please verify your email address to fully activate your account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px;">
            Or copy this link in your browser:
            <br>
            <code style="background-color: #f0f0f0; padding: 10px; display: block; word-break: break-all; margin-top: 10px;">
              ${verificationLink}
            </code>
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 24 hours.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const result = await sendEmailSmart(mailOptions, 'Verification email');
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} token - Reset token
 */
export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Sona Social Hub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - Sona Social Hub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 20px;">Password Reset Request</h1>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We received a request to reset the password for your Sona Social Hub account. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px;">
            Or copy this link in your browser:
            <br>
            <code style="background-color: #f0f0f0; padding: 10px; display: block; word-break: break-all; margin-top: 10px;">
              ${resetLink}
            </code>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            <strong>Security Note:</strong> If you didn't request this, please ignore this email and your password will remain unchanged.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const result = await sendEmailSmart(mailOptions, 'Password reset email');
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
};

// Export the working transporter for direct access if needed
export default gmailTransporter;

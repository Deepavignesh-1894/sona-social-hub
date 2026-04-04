import nodemailer from 'nodemailer';

// Create email transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // Add debug logging
  debug: true,
  logger: true,
  // Add connection timeout and retry settings
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
});

/**
 * Send verification email to user
 * @param {string} email - User email
 * @param {string} token - Verification token
 */
export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

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
    // Verify transporter configuration before sending
    await transporter.verify();
    console.log('Email transporter verified successfully');
    
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${email}`);
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('Email sending error:', error);
    console.error('Error details:', {
      user: process.env.EMAIL_USER,
      passwordConfigured: !!process.env.EMAIL_PASSWORD,
      frontendUrl: process.env.FRONTEND_URL,
      recipientEmail: email
    });
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} token - Reset token
 */
export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

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
    // Verify transporter configuration before sending
    await transporter.verify();
    console.log('Email transporter verified successfully');
    
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent successfully to ${email}`);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Email sending error:', error);
    console.error('Error details:', {
      user: process.env.EMAIL_USER,
      passwordConfigured: !!process.env.EMAIL_PASSWORD,
      frontendUrl: process.env.FRONTEND_URL,
      recipientEmail: email
    });
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
};

export default transporter;

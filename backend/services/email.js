import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'deepavignesh@gmail.com',
    pass: process.env.EMAIL_PASS || 'Deepa1894.',
  },
});

export const sendVerificationEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Sona Social Hub" <${process.env.EMAIL_USER || 'deepavignesh@gmail.com'}>`,
    to,
    subject: 'Email Verification - Sona Social Hub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4a5568; margin-bottom: 20px;">Email Verification</h2>
        <p style="color: #718096; line-height: 1.6;">Thank you for registering with Sona Social Hub. Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f7fafc; border: 2px dashed #cbd5e0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2d3748; font-size: 32px; letter-spacing: 4px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #718096; line-height: 1.6;">This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
        <p style="color: #a0aec0; font-size: 12px; margin-top: 30px;">Sona Social Hub Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

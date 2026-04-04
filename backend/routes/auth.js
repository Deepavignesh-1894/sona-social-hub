import express from 'express';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/emailServiceHybrid.js';

const router = express.Router();
const EMAIL_DOMAIN = /^[\w.-]+@sonatech\.ac\.in$/i;

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, role, officialTitle } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    if (!EMAIL_DOMAIN.test(email)) {
      return res.status(400).json({ message: 'Only sonatech.ac.in email allowed' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const userRole = role === 'official' ? 'official' : 'student';
    const verificationToken = randomBytes(32).toString('hex');
    
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      displayName: displayName || '',
      role: userRole,
      officialTitle: userRole === 'official' ? (officialTitle || '') : '',
      verificationToken,
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      emailVerified: false,
    });
    
    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
      console.log(`Verification email sent successfully to ${user.email}`);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail registration, but include warning in response
      // User can still request verification email later
    }
    
    const token = genToken(user._id);
    const u = await User.findById(user._id).select('-password -verificationToken -passwordResetToken');
    res.status(201).json({ 
      token, 
      user: u,
      message: 'Registration successful! Please check your email to verify your account.',
    });
  } catch (e) {
    if (e.code === 11000) res.status(400).json({ message: 'Email already registered' });
    else res.status(500).json({ message: e.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = genToken(user._id);
    const u = await User.findById(user._id).select('-password -verificationToken -passwordResetToken');
    res.json({ token, user: u });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Login failed' });
  }
});

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

// Verify email with token
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Verification token required' });
    }

    const user = await User.findOne({ 
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    }).select('+verificationToken +verificationExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;
    await user.save();

    res.json({ message: 'Email verified successfully!' });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Verification failed' });
  }
});

// Resend verification email
router.post('/resend-verification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+verificationToken +verificationExpires');

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const verificationToken = randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    try {
      await sendVerificationEmail(user.email, verificationToken);
      console.log(`Verification email sent successfully to ${user.email}`);
      res.json({ message: 'Verification email sent! Check your inbox.' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Provide specific error message to help user understand the issue
      const errorMessage = emailError.message || 'Failed to send verification email';
      if (errorMessage.includes('Missing credentials') || errorMessage.includes('EAUTH')) {
        res.status(500).json({ 
          message: 'Email service is not configured properly. Please contact the administrator or try again later.' 
        });
      } else {
        res.status(500).json({ 
          message: 'Failed to send verification email. Please try again later.' 
        });
      }
    }
  } catch (e) {
    res.status(500).json({ message: e.message || 'Failed to resend verification' });
  }
});

// Forgot password - request reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
    }

    const resetToken = randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, resetToken);
      console.log(`Password reset email sent successfully to ${user.email}`);
      res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Provide specific error message to help user understand the issue
      const errorMessage = emailError.message || 'Failed to send reset email';
      if (errorMessage.includes('Missing credentials') || errorMessage.includes('EAUTH')) {
        res.status(500).json({ 
          message: 'Email service is not configured properly. Please contact the administrator or try again later.' 
        });
      } else {
        res.status(500).json({ 
          message: 'Failed to send reset email. Please try again later.' 
        });
      }
    }
  } catch (e) {
    res.status(500).json({ message: e.message || 'Failed to send reset email' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpires +password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully! You can now login with your new password.' });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Password reset failed' });
  }
});

export default router;

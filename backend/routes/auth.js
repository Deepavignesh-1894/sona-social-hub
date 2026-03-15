import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

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
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      displayName: displayName || '',
      role: userRole,
      officialTitle: userRole === 'official' ? (officialTitle || '') : '',
    });
    const token = genToken(user._id);
    const u = await User.findById(user._id).select('-password');
    res.status(201).json({ token, user: u });
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
    const u = await User.findById(user._id).select('-password');
    res.json({ token, user: u });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Login failed' });
  }
});

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

export default router;

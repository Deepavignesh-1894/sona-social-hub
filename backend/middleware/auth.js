import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.isBanned) return res.status(403).json({ message: 'Your account has been banned' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
};

export const officialOrAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'official') {
    return res.status(403).json({ message: 'Official or Admin only' });
  }
  next();
};

export const officialApproved = (req, res, next) => {
  if (req.user?.role === 'official' && !req.user?.isOfficialApproved) {
    return res.status(403).json({ message: 'Your official account is pending approval' });
  }
  next();
};

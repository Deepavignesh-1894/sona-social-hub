import express from 'express';
import User from '../models/User.js';
import { protect, adminOnly, officialOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/officials', protect, async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase();
    const officials = await User.find({
      role: 'official',
      isOfficialApproved: true,
      $or: [
        { email: new RegExp(q, 'i') },
        { displayName: new RegExp(q, 'i') },
        { officialTitle: new RegExp(q, 'i') },
      ],
    })
      .select('email displayName officialTitle avatar')
      .limit(30);
    res.json(officials);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/group-officials/:groupId', protect, async (req, res) => {
  try {
    const GroupMember = (await import('../models/GroupMember.js')).default;
    const members = await GroupMember.find({ group: req.params.groupId })
      .populate('user', 'email displayName officialTitle avatar role')
      .lean();
    const officials = members
      .filter((m) => m.user && m.user.role === 'official')
      .map((m) => m.user);
    res.json(officials);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

router.patch('/profile', protect, async (req, res) => {
  try {
    const { displayName, avatar } = req.body;
    const u = await User.findByIdAndUpdate(
      req.user._id,
      { ...(displayName !== undefined && { displayName }), ...(avatar !== undefined && { avatar }) },
      { new: true }
    ).select('-password');
    res.json(u);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch('/admin/approve-official/:id', protect, adminOnly, async (req, res) => {
  try {
    const u = await User.findByIdAndUpdate(
      req.params.id,
      { isOfficialApproved: true },
      { new: true }
    ).select('-password');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch('/admin/role/:id', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'official', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const u = await User.findByIdAndUpdate(
      req.params.id,
      { role, ...(role === 'official' ? { isOfficialApproved: false } : {}) },
      { new: true }
    ).select('-password');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

import express from 'express';
import Report from '../models/Report.js';
import { protect, adminOnly, officialApproved } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, officialApproved, async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    if (!['post', 'comment', 'message'].includes(targetType) || !targetId) {
      return res.status(400).json({ message: 'targetType and targetId required' });
    }
    const report = await Report.create({
      reportedBy: req.user._id,
      targetType,
      targetId,
      targetModel: targetType === 'post' ? 'Post' : targetType === 'comment' ? 'Comment' : 'Message',
      reason: reason || '',
    });
    res.status(201).json(report);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'email displayName role')
      .populate({ 
        path: 'targetId', 
        populate: [
          { path: 'author', select: 'displayName email officialTitle randomName role' },
          { path: 'group', select: 'name description' }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();
    res.json(reports);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) return res.status(404).json({ message: 'Not found' });
    res.json(report);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

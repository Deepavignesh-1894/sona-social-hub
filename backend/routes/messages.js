import express from 'express';
import Message from '../models/Message.js';
import Group from '../models/Group.js';
import GroupMember from '../models/GroupMember.js';
import { protect, officialApproved } from '../middleware/auth.js';

const router = express.Router();

// Get messages for a group
router.get('/group/:groupId', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = await GroupMember.findOne({ group: groupId, user: req.user._id });
    if (!group.isPublic && !isMember) return res.status(403).json({ message: 'Not a member' });

    const messages = await Message.find({ group: groupId })
      .populate('author', 'displayName randomName email officialTitle role')
      .populate({ path: 'replyTo', populate: { path: 'author', select: 'displayName randomName role' } })
      .sort({ createdAt: 1 });
    const safe = messages.map((m) => ({
      ...m.toObject(),
      author: m.author
        ? {
            _id: m.author._id,
            displayName: m.author.role === 'official' ? m.author.displayName : m.author.randomName || m.author.displayName,
            randomName: m.author.randomName,
            email: req.user?.role === 'admin' ? m.author.email : undefined,
            officialTitle: m.author.officialTitle,
            role: m.author.role,
          }
        : null,
      replyTo: m.replyTo
        ? {
            _id: m.replyTo._id,
            content: m.replyTo.content,
            author: m.replyTo.author
              ? {
                  _id: m.replyTo.author._id,
                  displayName: m.replyTo.author.role === 'official' ? m.replyTo.author.displayName : m.replyTo.author.randomName || m.replyTo.author.displayName,
                  randomName: m.replyTo.author.randomName,
                  role: m.replyTo.author.role,
                }
              : null,
          }
        : null,
    }));
    res.json(safe);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Create a message
router.post('/', protect, async (req, res) => {
  try {
    const { groupId, content, attachments, replyTo } = req.body;
    if (!groupId || (!content?.trim() && (!attachments || !attachments.length))) {
      return res.status(400).json({ message: 'Group and message required' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = await GroupMember.findOne({ group: groupId, user: req.user._id });
    if (!group.isPublic && !isMember) return res.status(403).json({ message: 'Not a member' });

    const message = new Message({
      group: groupId,
      author: req.user._id,
      content: content?.trim() || '',
      attachments: Array.isArray(attachments) ? attachments : [],
      replyTo: replyTo || null,
    });
    await message.save();
    await message.populate('author', 'displayName randomName email officialTitle role');
    await message.populate({ path: 'replyTo', populate: { path: 'author', select: 'displayName randomName role' } });
    const result = {
      ...message.toObject(),
      author: message.author
        ? {
            _id: message.author._id,
            displayName: message.author.role === 'official' ? message.author.displayName : message.author.randomName || message.author.displayName,
            randomName: message.author.randomName,
            email: req.user?.role === 'admin' ? message.author.email : undefined,
            officialTitle: message.author.officialTitle,
            role: message.author.role,
          }
        : null,
      replyTo: message.replyTo
        ? {
            _id: message.replyTo._id,
            content: message.replyTo.content,
            author: message.replyTo.author
              ? {
                  _id: message.replyTo.author._id,
                  displayName: message.replyTo.author.role === 'official' ? message.replyTo.author.displayName : message.replyTo.author.randomName || message.replyTo.author.displayName,
                  randomName: message.replyTo.author.randomName,
                  role: message.replyTo.author.role,
                }
              : null,
          }
        : null,
    };
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// React to a message (toggle)
router.post('/:id/react', protect, async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ message: 'Emoji required' });

    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const existing = message.reactions.find((r) => r.user.toString() === req.user._id.toString() && r.emoji === emoji);
    if (existing) {
      message.reactions = message.reactions.filter((r) => !(r.user.toString() === req.user._id.toString() && r.emoji === emoji));
    } else {
      message.reactions.push({ user: req.user._id, emoji });
    }

    await message.save();
    res.json({ reactions: message.reactions });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete a message (admin or author)
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    if (req.user._id.toString() !== message.author.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
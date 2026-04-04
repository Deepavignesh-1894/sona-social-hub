import express from 'express';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Post from '../models/Post.js';
import Message from '../models/Message.js';
import GroupMember from '../models/GroupMember.js';
import Report from '../models/Report.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const [usersCount, groupsCount, postsCount, pendingOfficials, reportsCount] = await Promise.all([
      User.countDocuments(),
      Group.countDocuments(),
      Post.countDocuments(),
      User.countDocuments({ role: 'official', isOfficialApproved: false }),
      Report.countDocuments({ status: 'pending' }),
    ]);
    res.json({
      usersCount,
      groupsCount,
      postsCount,
      pendingOfficials,
      reportsCount,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/pending-officials', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'official', isOfficialApproved: false })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/all-posts', protect, adminOnly, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'email displayName officialTitle role')
      .populate('group', 'name slug')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(posts);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/all-groups', protect, adminOnly, async (req, res) => {
  try {
    const groups = await Group.find().populate('createdBy', 'email displayName officialTitle').sort({ createdAt: -1 }).lean();
    res.json(groups);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch('/user/:id/ban', protect, adminOnly, async (req, res) => {
  try {
    const { ban } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBanned = Boolean(ban);
    await user.save();
    res.json({ _id: user._id, isBanned: user.isBanned });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/all-users-detailed', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();
    
    // Get groups for each user
    const usersWithGroups = await Promise.all(
      users.map(async (user) => {
        const memberships = await GroupMember.find({ user: user._id })
          .populate('group', 'name slug isPublic')
          .lean();
        return {
          ...user,
          groups: memberships.map(m => m.group)
        };
      })
    );
    
    res.json(usersWithGroups);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/group-activity/:groupId', protect, adminOnly, async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId).populate('createdBy', 'displayName email').lean();
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const [posts, messages, members] = await Promise.all([
      Post.find({ group: groupId })
        .populate('author', 'displayName randomName email role')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Message.find({ group: groupId })
        .populate('author', 'displayName randomName email role')
        .populate({ path: 'replyTo', populate: { path: 'author', select: 'displayName randomName' } })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      GroupMember.find({ group: groupId })
        .populate('user', 'displayName randomName email role')
        .lean()
    ]);

    res.json({
      group,
      posts,
      messages,
      members: members.map(m => m.user)
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

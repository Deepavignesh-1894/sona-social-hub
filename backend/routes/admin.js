import express from 'express';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Post from '../models/Post.js';
import Message from '../models/Message.js';
import GroupMember from '../models/GroupMember.js';
import Report from '../models/Report.js';
import Comment from '../models/Comment.js';
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

// ==================== ENHANCED ADMIN CONTROLS ====================

// Delete a user and all their content
router.delete('/user/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin users' });

    // Delete user's posts
    await Post.deleteMany({ author: req.params.id });
    // Delete user's comments
    await Comment.deleteMany({ author: req.params.id });
    // Delete user's messages
    await Message.deleteMany({ author: req.params.id });
    // Remove from groups
    await GroupMember.deleteMany({ user: req.params.id });
    // Delete user's groups
    await Group.deleteMany({ createdBy: req.params.id });
    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and all associated content deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Update user role
router.patch('/user/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role, officialTitle } = req.body;
    if (!['student', 'official', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    if (role === 'official') {
      user.officialTitle = officialTitle || '';
      user.isOfficialApproved = true;
      user.isAnonymous = false;
    } else if (role === 'admin') {
      user.isAnonymous = false;
    }
    
    await user.save();
    const updatedUser = await User.findById(user._id).select('-password -verificationToken -passwordResetToken');
    res.json(updatedUser);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Force verify user email
router.patch('/user/:id/verify-email', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;
    await user.save();

    res.json({ message: 'User email verified' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete a post
router.delete('/post/:id', protect, adminOnly, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Delete associated comments
    await Comment.deleteMany({ post: req.params.id });

    res.json({ message: 'Post and comments deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete a comment
router.delete('/comment/:id', protect, adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete a group
router.delete('/group/:id', protect, adminOnly, async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Delete group posts
    await Post.deleteMany({ group: req.params.id });
    // Delete group messages
    await Message.deleteMany({ group: req.params.id });
    // Remove members
    await GroupMember.deleteMany({ group: req.params.id });

    res.json({ message: 'Group and all related content deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get unverified users
router.get('/users-unverified', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ emailVerified: false })
      .select('-password -verificationToken -passwordResetToken')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get all users (paginated)
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';

    const query = search
      ? {
          $or: [
            { email: new RegExp(search, 'i') },
            { displayName: new RegExp(search, 'i') }
          ]
        }
      : {};

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -verificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get user statistics
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      totalPosts,
      totalComments,
      totalGroups,
      totalMessages,
      bannedUsers,
      officials,
      admins,
      postsToday,
      usersToday
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ emailVerified: true }),
      User.countDocuments({ emailVerified: false }),
      Post.countDocuments(),
      Comment.countDocuments(),
      Group.countDocuments(),
      Message.countDocuments(),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ role: 'official' }),
      User.countDocuments({ role: 'admin' }),
      Post.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) } }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) } })
    ]);

    res.json({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        unverified: unverifiedUsers,
        banned: bannedUsers,
        officials: officials,
        admins: admins,
        joinedToday: usersToday
      },
      content: {
        posts: totalPosts,
        comments: totalComments,
        groups: totalGroups,
        messages: totalMessages,
        postsToday: postsToday
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Approve official request
router.patch('/approve-official/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'official') return res.status(400).json({ message: 'User is not an official' });

    user.isOfficialApproved = true;
    await user.save();

    res.json({ message: 'Official approved', user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Reject/revoke official status
router.patch('/reject-official/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isOfficialApproved = false;
    if (user.role === 'official') {
      user.role = 'student';
    }
    await user.save();

    res.json({ message: 'Official status revoked', user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get reports
router.get('/reports', protect, adminOnly, async (req, res) => {
  try {
    const status = req.query.status || 'all';
    const query = status !== 'all' ? { status } : {};

    const reports = await Report.find(query)
      .populate('reportedBy', 'email displayName')
      .populate('post', 'content author')
      .populate('user', 'email displayName')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(reports);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Handle report (delete content and/or warn user)
router.patch('/report/:id', protect, adminOnly, async (req, res) => {
  try {
    const { action, status } = req.body; // action: 'delete_post', 'warn_user', 'ban_user', etc.
    const report = await Report.findById(req.params.id).populate('post user');

    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (action === 'delete_post' && report.post) {
      await Post.findByIdAndDelete(report.post._id);
    } else if (action === 'ban_user' && report.user) {
      const user = await User.findById(report.user._id);
      user.isBanned = true;
      await user.save();
    } else if (action === 'warn_user') {
      // Could add a warning system here
    }

    report.status = status || 'resolved';
    await report.save();

    res.json({ message: 'Report handled', report });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

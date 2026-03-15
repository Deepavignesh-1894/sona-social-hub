import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import GroupMember from '../models/GroupMember.js';
import { protect, adminOnly, officialApproved } from '../middleware/auth.js';

const router = express.Router();

router.get('/public', protect, officialApproved, async (req, res) => {
  try {
    const posts = await Post.find({ isPublic: true, group: null })
      .populate('author', 'displayName email officialTitle avatar role isAnonymous randomName')
      .populate('taggedOfficials', 'displayName officialTitle email avatar')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const safe = posts.map((p) => ({
      ...p,
      author: p.author
        ? {
            _id: p.author._id,
            displayName: p.author.role === 'official' ? p.author.displayName : p.author.randomName || p.author.displayName,
            randomName: p.author.randomName,
            email: req.user?.role === 'admin' ? p.author.email : undefined,
            officialTitle: p.author.officialTitle,
            avatar: p.author.avatar,
            role: p.author.role,
          }
        : null,
    }));
    res.json(safe);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/group/:groupId', protect, officialApproved, async (req, res) => {
  try {
    const member = await GroupMember.findOne({ group: req.params.groupId, user: req.user._id });
    if (!member && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not a member' });
    }
    const posts = await Post.find({ group: req.params.groupId })
      .populate('author', 'displayName email officialTitle avatar role isAnonymous randomName')
      .populate('taggedOfficials', 'displayName officialTitle email avatar')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const safe = posts.map((p) => ({
      ...p,
      author: p.author
        ? {
            _id: p.author._id,
            displayName: p.author.role === 'official' ? p.author.displayName : p.author.randomName || p.author.displayName,
            randomName: p.author.randomName,
            email: req.user?.role === 'admin' ? p.author.email : undefined,
            officialTitle: p.author.officialTitle,
            avatar: p.author.avatar,
            role: p.author.role,
          }
        : null,
    }));
    res.json(safe);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/', protect, officialApproved, async (req, res) => {
  try {
    const { title, category, content, type, attachments, pollOptions, taggedOfficials, groupId, isPublic } = req.body;
    const group = groupId || null;
    if (group) {
      const member = await GroupMember.findOne({ group, user: req.user._id });
      if (!member && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not a member' });
      }
    }
    const post = await Post.create({
      author: req.user._id,
      group,
      title: title || '',
      category: category || 'other',
      type: type || 'text',
      content: content || '',
      attachments: Array.isArray(attachments) ? attachments : [],
      pollOptions: Array.isArray(pollOptions) ? pollOptions.map((t) => ({ text: t, votes: [] })) : [],
      taggedOfficials: Array.isArray(taggedOfficials) ? taggedOfficials : [],
      isPublic: group ? false : (isPublic !== false),
    });
    const p = await Post.findById(post._id)
      .populate('author', 'displayName email officialTitle avatar role isAnonymous randomName')
      .populate('taggedOfficials', 'displayName officialTitle email avatar')
      .lean();
    const safe = {
      ...p,
      author: p.author
        ? {
            _id: p.author._id,
            displayName: p.author.role === 'official' ? p.author.displayName : p.author.randomName || p.author.displayName,
            randomName: p.author.randomName,
            email: undefined,
            officialTitle: p.author.officialTitle,
            avatar: p.author.avatar,
            role: p.author.role,
          }
        : null,
    };
    res.status(201).json(safe);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id', protect, officialApproved, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'displayName email officialTitle avatar role isAnonymous randomName')
      .populate('taggedOfficials', 'displayName officialTitle email avatar')
      .lean();
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const safe = {
      ...post,
      author: post.author
        ? {
            _id: post.author._id,
            displayName: post.author.role === 'official' ? post.author.displayName : post.author.randomName || post.author.displayName,
            randomName: post.author.randomName,
            email: req.user?.role === 'admin' ? post.author.email : undefined,
            officialTitle: post.author.officialTitle,
            avatar: post.author.avatar,
            role: post.author.role,
          }
        : null,
    };
    res.json(safe);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch('/:id/like', protect, officialApproved, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.likes.findIndex((id) => id.toString() === req.user._id.toString());
    if (idx >= 0) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(req.user._id);
    }
    post.likeCount = post.likes.length;
    await post.save();
    res.json({ likeCount: post.likeCount, liked: post.likes.some((id) => id.toString() === req.user._id.toString()) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/:id/poll-vote', protect, officialApproved, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post || post.type !== 'poll' || !post.pollOptions?.length) return res.status(400).json({ message: 'Invalid' });
    const i = Number(optionIndex);
    if (i < 0 || i >= post.pollOptions.length) return res.status(400).json({ message: 'Invalid option' });
    for (const opt of post.pollOptions) {
      opt.votes = opt.votes.filter((id) => id.toString() !== req.user._id.toString());
    }
    post.pollOptions[i].votes.push(req.user._id);
    await post.save();
    res.json(post.pollOptions.map((o) => ({ text: o.text, votes: o.votes.length })));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

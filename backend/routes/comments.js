import express from 'express';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { protect, adminOnly, officialApproved } from '../middleware/auth.js';

const router = express.Router();

router.get('/post/:postId', protect, officialApproved, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'displayName email officialTitle avatar role isAnonymous randomName')
      .sort({ createdAt: 1 })
      .lean();
    const safe = comments.map((c) => ({
      ...c,
      author: c.author
        ? {
            _id: c.author._id,
            displayName: c.author.role === 'official' ? c.author.displayName : c.author.randomName || c.author.displayName,
            randomName: c.author.randomName,
            email: req.user?.role === 'admin' ? c.author.email : undefined,
            officialTitle: c.author.officialTitle,
            avatar: c.author.avatar,
            role: c.author.role,
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
    const { postId, content } = req.body;
    if (!postId || !content?.trim()) return res.status(400).json({ message: 'Post and content required' });
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: content.trim(),
    });
    const c = await Comment.findById(comment._id)
      .populate('author', 'displayName email officialTitle avatar role isAnonymous randomName')
      .lean();
    const safe = {
      ...c,
      author: c.author
        ? {
            _id: c.author._id,
            displayName: c.author.role === 'official' ? c.author.displayName : c.author.randomName || c.author.displayName,
            randomName: c.author.randomName,
            officialTitle: c.author.officialTitle,
            avatar: c.author.avatar,
            role: c.author.role,
          }
        : null,
    };
    res.status(201).json(safe);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch('/:id/like', protect, officialApproved, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    const idx = comment.likes.findIndex((id) => id.toString() === req.user._id.toString());
    if (idx >= 0) comment.likes.splice(idx, 1);
    else comment.likes.push(req.user._id);
    comment.likeCount = comment.likes.length;
    await comment.save();
    res.json({ likeCount: comment.likeCount });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (req.user.role !== 'admin' && comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    await Comment.findByIdAndDelete(comment._id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

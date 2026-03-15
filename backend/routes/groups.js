import express from 'express';
import Group from '../models/Group.js';
import GroupMember from '../models/GroupMember.js';
import { protect, adminOnly, officialOrAdmin, officialApproved } from '../middleware/auth.js';

const router = express.Router();

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

router.get('/', protect, officialApproved, async (req, res) => {
  try {
    const groups = await Group.find().populate('createdBy', 'displayName officialTitle email').sort({ createdAt: -1 }).lean();
    res.json(groups);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/my', protect, officialApproved, async (req, res) => {
  try {
    const memberships = await GroupMember.find({ user: req.user._id })
      .populate('group')
      .lean();
    const groups = memberships.map((m) => ({ ...m.group, memberRole: m.role }));
    res.json(groups);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id', protect, officialApproved, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('createdBy', 'displayName officialTitle email avatar').lean();
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const member = await GroupMember.findOne({ group: group._id, user: req.user._id }).lean();
    res.json({ ...group, isMember: !!member, memberRole: member?.role });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id/members', protect, officialApproved, async (req, res) => {
  try {
    const members = await GroupMember.find({ group: req.params.id })
      .populate('user', 'displayName email officialTitle avatar role')
      .lean();
    res.json(members);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/', protect, officialOrAdmin, officialApproved, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Group name required' });
    const slug = slugify(name);
    const exists = await Group.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Group name already exists' });
    const group = await Group.create({
      name: name.trim(),
      slug,
      description: description || '',
      createdBy: req.user._id,
    });
    await GroupMember.create({ group: group._id, user: req.user._id, role: 'moderator' });
    const g = await Group.findById(group._id).populate('createdBy', 'displayName officialTitle email');
    res.status(201).json(g);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/:id/join', protect, officialApproved, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const existing = await GroupMember.findOne({ group: group._id, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already a member' });
    await GroupMember.create({ group: group._id, user: req.user._id });
    res.json({ message: 'Joined' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/:id/leave', protect, officialApproved, async (req, res) => {
  try {
    await GroupMember.findOneAndDelete({ group: req.params.id, user: req.user._id });
    res.json({ message: 'Left' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const isAdmin = req.user.role === 'admin';
    const isCreator = group.createdBy.toString() === req.user._id.toString();
    if (!isAdmin && !isCreator) return res.status(403).json({ message: 'Not allowed' });
    const { name, description, coverImage } = req.body;
    const updates = {};
    if (name?.trim()) {
      updates.name = name.trim();
      updates.slug = slugify(name);
    }
    if (description !== undefined) updates.description = description;
    if (coverImage !== undefined) updates.coverImage = coverImage;
    const g = await Group.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('createdBy', 'displayName officialTitle email');
    res.json(g);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    await GroupMember.deleteMany({ group: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

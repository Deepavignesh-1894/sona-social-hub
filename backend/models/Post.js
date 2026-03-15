import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null,
  },
  category: {
    type: String,
    enum: ['problem', 'request', 'casual', 'demand', 'other'],
    default: 'other',
  },
  title: {
    type: String,
    default: '',
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'photo', 'poll'],
    default: 'text',
  },
  content: {
    type: String,
    default: '',
  },
  attachments: [{
    type: String,
  }],
  pollOptions: [pollOptionSchema],
  taggedOfficials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  likeCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

postSchema.index({ group: 1, createdAt: -1 });
postSchema.index({ isPublic: 1, createdAt: -1 });

export default mongoose.model('Post', postSchema);

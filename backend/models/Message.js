import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    default: '',
    trim: true,
  },
  attachments: [{ type: String }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  reactions: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      emoji: { type: String },
    },
  ],
}, { timestamps: true });

messageSchema.index({ group: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);
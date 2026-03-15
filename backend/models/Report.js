import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetType: {
    type: String,
    enum: ['post', 'comment', 'message'],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel',
    required: true,
  },
  targetModel: {
    type: String,
    enum: ['Post', 'Comment', 'Message'],
    required: true,
  },
  reason: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
  },
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w.-]+@sonatech\.ac\.in$/i, 'Only sonatech.ac.in emails allowed'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  displayName: {
    type: String,
    default: '',
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'official', 'admin'],
    default: 'student',
  },
  officialTitle: {
    type: String,
    enum: ['', 'Professor', 'Assistant Professor', 'HoD', 'Principal'],
    default: '',
  },
  isOfficialApproved: {
    type: Boolean,
    default: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  randomName: {
    type: String,
    default: '',
  },
  isAnonymous: {
    type: Boolean,
    default: true,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

userSchema.pre('save', function (next) {
  if (this.role === 'official' && this.isNew) {
    this.isOfficialApproved = false;
    this.isAnonymous = false;
  }
  if (this.role === 'official') this.isAnonymous = false;
  if (!this.randomName) {
    const randomNum = Math.floor(Math.random() * 900) + 100; // 100-999
    if (this.role === 'student') {
      this.randomName = `sonastudent${randomNum}`;
    } else if (this.role === 'official') {
      const title = this.officialTitle ? this.officialTitle.replace(/\s+/g, '') : 'Official';
      this.randomName = `sona${title}${randomNum}`;
    } else if (this.role === 'admin') {
      this.randomName = `sonaadmin${randomNum}`;
    }
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);

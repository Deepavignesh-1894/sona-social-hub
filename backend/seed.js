import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Sona-Social-hub');
  const existing = await User.findOne({ email: 'admin@sonatech.ac.in' });
  if (existing) {
    console.log('Admin already exists');
  } else {
    await User.create({
      email: 'admin@sonatech.ac.in',
      password: 'admin123',
      displayName: 'Admin',
      role: 'admin',
      isOfficialApproved: true,
    });
    console.log('Admin created: admin@sonatech.ac.in / admin123');
  }

  // Update all users without randomName
  const users = await User.find({ randomName: { $exists: false } });
  for (const user of users) {
    const randomNum = Math.floor(Math.random() * 900) + 100;
    if (user.role === 'student') {
      user.randomName = `sonastudent${randomNum}`;
    } else if (user.role === 'official') {
      const title = user.officialTitle ? user.officialTitle.replace(/\s+/g, '') : 'Official';
      user.randomName = `sona${title}${randomNum}`;
    } else if (user.role === 'admin') {
      user.randomName = `sonaadmin${randomNum}`;
    }
    await user.save();
  }
  console.log(`Updated ${users.length} users with random names`);

  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

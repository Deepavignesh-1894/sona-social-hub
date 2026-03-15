import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import groupRoutes from './routes/groups.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import reportRoutes from './routes/reports.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import messageRoutes from './routes/messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_PATH || 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb+srv://rockybhai1894_db_user:r7NSuuRXOdsp2LfY@cluster0.ii7lac0.mongodb.net/sona_social_hub_final?retryWrites=true&w=majority')
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('DB error:', err));

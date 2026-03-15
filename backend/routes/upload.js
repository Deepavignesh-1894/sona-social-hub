import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { upload } from '../config/upload.js';
import { protect } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.post('/image', protect, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;

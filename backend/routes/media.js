const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok =
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (ok) cb(null, true);
    else cb(new Error('Unsupported file type'), false);
  },
});

router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json([]);
    }
    const files = fs
      .readdirSync(uploadsDir)
      .filter((name) => !name.startsWith('.'))
      .map((name) => {
        const full = path.join(uploadsDir, name);
        const stat = fs.statSync(full);
        return {
          filename: name,
          url: `/uploads/${name}`,
          size: stat.size,
          updatedAt: stat.mtime,
        };
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const q = (req.query.q || '').toString().toLowerCase();
    const filtered = q ? files.filter((f) => f.filename.toLowerCase().includes(q)) : files;
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: 'Unable to list media', error: error.message });
  }
});

router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(201).json({
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
    });
  } catch (error) {
    res.status(400).json({ message: 'Upload failed', error: error.message });
  }
});

router.delete('/:filename', (req, res) => {
  try {
    const safe = path.basename(req.params.filename);
    const full = path.join(uploadsDir, safe);
    if (!full.startsWith(uploadsDir)) {
      return res.status(400).json({ message: 'Invalid path' });
    }
    if (!fs.existsSync(full)) {
      return res.status(404).json({ message: 'File not found' });
    }
    fs.unlinkSync(full);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

module.exports = { router, upload };

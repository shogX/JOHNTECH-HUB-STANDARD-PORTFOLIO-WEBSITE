const express = require('express');
const multer = require('multer');
const path = require('path');
const Job = require('../models/Job');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

const parseList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean);
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim().toLowerCase();
    const category = (req.query.category || '').toString().trim().toLowerCase();
    const filter = {};
    if (category && category !== 'all') {
      if (category === 'web') {
        filter.category = { $regex: /web|frontend|react|javascript/i };
      } else if (category === 'design') {
        filter.category = { $regex: /design|ui|ux|figma/i };
      } else if (category === 'api') {
        filter.category = { $regex: /api|backend|node|server/i };
      } else {
        filter.category = { $regex: new RegExp(category, 'i') };
      }
    }
    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { company: new RegExp(q, 'i') },
      ];
    }
    const jobs = await Job.find(filter).sort({ order: 1, postedAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load jobs', error: error.message });
  }
});

router.put('/reorder', requireAuth, async (req, res) => {
  try {
    const { jobs } = req.body || {};
    if (!Array.isArray(jobs)) {
      return res.status(400).json({ message: 'Expected { jobs: [{ id, order }] }' });
    }
    const ops = jobs.map((row) => ({
      updateOne: {
        filter: { _id: row.id },
        update: { $set: { order: row.order } },
      },
    }));
    if (ops.length) await Job.bulkWrite(ops);
    res.json({ message: 'Projects reordered' });
  } catch (error) {
    res.status(500).json({ message: 'Reorder failed', error: error.message });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: 'View tracking failed', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load job', error: error.message });
  }
});

router.post(
  '/',
  requireAuth,
  upload.fields([
    { name: 'imageFile', maxCount: 1 },
    { name: 'galleryFiles', maxCount: 12 },
  ]),
  async (req, res) => {
    try {
      let image = req.body.imageUrl || '';
      if (req.files && req.files.imageFile && req.files.imageFile[0]) {
        image = `/uploads/${req.files.imageFile[0].filename}`;
      }

      const gallery = [];
      if (req.files && req.files.galleryFiles) {
        req.files.galleryFiles.forEach((f) => gallery.push(`/uploads/${f.filename}`));
      }
      parseList(req.body.galleryUrls).forEach((u) => gallery.push(u));

      const newJob = new Job({
        title: req.body.title,
        company: req.body.company,
        description: req.body.description,
        image,
        gallery,
        category: req.body.category,
        link: req.body.link,
        githubUrl: req.body.githubUrl,
        liveUrl: req.body.liveUrl,
        technologies: parseList(req.body.technologies),
        status: req.body.status || 'published',
        featured: req.body.featured === 'true' || req.body.featured === true,
        order: Number(req.body.order) || 0,
      });

      const savedJob = await newJob.save();
      res.status(201).json(savedJob);
    } catch (error) {
      res.status(400).json({ message: 'Job creation failed', error: error.message });
    }
  }
);

router.put(
  '/:id',
  requireAuth,
  upload.fields([
    { name: 'imageFile', maxCount: 1 },
    { name: 'galleryFiles', maxCount: 12 },
  ]),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ message: 'Job not found' });

      const allowed = [
        'title',
        'company',
        'description',
        'category',
        'link',
        'githubUrl',
        'liveUrl',
        'technologies',
        'status',
        'featured',
        'order',
        'gallery',
        'image',
      ];
      const update = {};
      allowed.forEach((key) => {
        if (req.body[key] !== undefined) update[key] = req.body[key];
      });
      if (req.files && req.files.imageFile && req.files.imageFile[0]) {
        update.image = `/uploads/${req.files.imageFile[0].filename}`;
      }
      if (req.files && req.files.galleryFiles && req.files.galleryFiles.length) {
        const extra = req.files.galleryFiles.map((f) => `/uploads/${f.filename}`);
        update.gallery = [...(job.gallery || []), ...extra];
      }
      if (typeof update.technologies === 'string') {
        update.technologies = parseList(update.technologies);
      }
      if (typeof update.galleryUrls === 'string') {
        update.gallery = [...(update.gallery || job.gallery || []), ...parseList(update.galleryUrls)];
      }
      delete update.galleryUrls;
      if (update.featured !== undefined) {
        update.featured = update.featured === 'true' || update.featured === true;
      }

      const updatedJob = await Job.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true,
      });
      res.json(updatedJob);
    } catch (error) {
      res.status(400).json({ message: 'Job update failed', error: error.message });
    }
  }
);

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Job delete failed', error: error.message });
  }
});

module.exports = router;

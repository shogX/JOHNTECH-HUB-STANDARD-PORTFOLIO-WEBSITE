const express = require('express');
const multer = require('multer');
const Job = require('../models/Job');

const router = express.Router();

// Multer config (reuse from server.js or define here)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + require('path').extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load jobs', error: error.message });
  }
});

// Get a single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load job', error: error.message });
  }
});

// Create a new job
router.post('/', upload.single('imageFile'), async (req, res) => {
  try {
    let image = req.body.imageUrl || '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const newJob = new Job({
      title: req.body.title,
      company: req.body.company,
      description: req.body.description,
      image: image,
      category: req.body.category,
      link: req.body.link,
      featured: req.body.featured === 'true' || req.body.featured === true,
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(400).json({ message: 'Job creation failed', error: error.message });
  }
});

// Update an existing job
router.put('/:id', async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedJob) return res.status(404).json({ message: 'Job not found' });
    res.json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: 'Job update failed', error: error.message });
  }
});

// Delete a job
router.delete('/:id', async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Job delete failed', error: error.message });
  }
});

module.exports = router;

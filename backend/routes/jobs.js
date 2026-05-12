const express = require('express');
const Job = require('../models/Job');

const router = express.Router();

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
router.post('/', async (req, res) => {
  try {
    const newJob = new Job(req.body);
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

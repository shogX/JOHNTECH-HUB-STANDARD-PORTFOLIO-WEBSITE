const express = require('express');
const Service = require('../models/Service');

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load services', error: error.message });
  }
});

// Create service
router.post('/', async (req, res) => {
  try {
    const service = new Service(req.body);
    const savedService = await service.save();
    res.status(201).json(savedService);
  } catch (error) {
    res.status(400).json({ message: 'Service creation failed', error: error.message });
  }
});

// Update service
router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: 'Service update failed', error: error.message });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Service delete failed', error: error.message });
  }
});

module.exports = router;

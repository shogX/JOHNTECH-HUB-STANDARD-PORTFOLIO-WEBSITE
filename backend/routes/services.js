const express = require('express');
const Service = require('../models/Service');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load services', error: error.message });
  }
});

router.put(
  '/reorder',
  requireAuth,
  async (req, res) => {
    try {
      const { services } = req.body;
      if (!Array.isArray(services)) {
        return res.status(400).json({ message: 'Expected { services: [{ id, order }] }' });
      }
      const ops = services.map((row) => ({
        updateOne: {
          filter: { _id: row.id },
          update: { $set: { order: row.order } },
        },
      }));
      if (ops.length) await Service.bulkWrite(ops);
      res.json({ message: 'Services reordered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Service reordering failed', error: error.message });
    }
  }
);

router.post('/', requireAuth, async (req, res) => {
  try {
    const service = new Service(req.body);
    const savedService = await service.save();
    res.status(201).json(savedService);
  } catch (error) {
    res.status(400).json({ message: 'Service creation failed', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Error fetching service', error: error.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
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

router.delete('/:id', requireAuth, async (req, res) => {
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

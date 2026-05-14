const express = require('express');
const Skill = require('../models/Skill');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1, createdAt: 1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load skills', error: error.message });
  }
});

router.put(
  '/reorder',
  requireAuth,
  async (req, res) => {
    try {
      const { skills } = req.body;
      if (!Array.isArray(skills)) {
        return res.status(400).json({ message: 'Invalid request body. Expected an array of skills with id and order.' });
      }

      const bulkOperations = skills.map((skill) => ({
        updateOne: {
          filter: { _id: skill.id },
          update: { $set: { order: skill.order } },
        },
      }));

      if (bulkOperations.length) await Skill.bulkWrite(bulkOperations);
      res.json({ message: 'Skills reordered successfully' });
    } catch (error) {
      console.error('Error reordering skills:', error);
      res.status(500).json({ message: 'Skill reordering failed', error: error.message });
    }
  }
);

router.post('/', requireAuth, async (req, res) => {
  try {
    const skill = new Skill(req.body);
    const savedSkill = await skill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    res.status(400).json({ message: 'Skill creation failed', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json(skill);
  } catch (error) {
    console.error('Error fetching skill:', error);
    res.status(500).json({ message: 'Error fetching skill', error: error.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!skill) {
      res.status(404).json({ message: 'Skill not found' });
      return;
    }
    res.json(skill);
  } catch (error) {
    res.status(400).json({ message: 'Skill update failed', error: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      res.status(404).json({ message: 'Skill not found' });
      return;
    }
    res.json({ message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Skill delete failed', error: error.message });
  }
});

module.exports = router;

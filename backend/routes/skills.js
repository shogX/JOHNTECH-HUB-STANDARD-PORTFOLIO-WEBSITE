const express = require('express');
const Skill = require('../models/Skill');

const router = express.Router();

// Get all skills
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load skills', error: error.message });
  }
});

// Create skill
router.post('/', async (req, res) => {
  try {
    const skill = new Skill(req.body);
    const savedSkill = await skill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    res.status(400).json({ message: 'Skill creation failed', error: error.message });
  }
});

// Update skill
router.put('/:id', async (req, res) => {
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

// Delete skill
router.delete('/:id', async (req, res) => {
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

// Reorder skills
router.put('/reorder/all', async (req, res) => {
  try {
    const { skills } = req.body; // array of { id, order }
    for (const item of skills) {
      await Skill.findByIdAndUpdate(item.id, { order: item.order });
    }
    res.json({ message: 'Skills reordered' });
  } catch (error) {
    res.status(400).json({ message: 'Reorder failed', error: error.message });
  }
});

module.exports = router;

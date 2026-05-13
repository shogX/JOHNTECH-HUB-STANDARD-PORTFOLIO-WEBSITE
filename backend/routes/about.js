const express = require('express');
const About = require('../models/About');

const router = express.Router();

// Get about data
router.get('/', async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = await About.create({});
    }
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load about data', error: error.message });
  }
});

// Update about data
router.put('/', async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = await About.create(req.body);
    } else {
      Object.assign(about, req.body);
      await about.save();
    }
    res.json(about);
  } catch (error) {
    res.status(400).json({ message: 'About update failed', error: error.message });
  }
});

// Add card
router.post('/cards', async (req, res) => {
  try {
    const about = await About.findOne();
    if (!about) {
      res.status(404).json({ message: 'About section not found' });
      return;
    }
    const newCard = {
      _id: new require('mongoose').Types.ObjectId(),
      ...req.body,
      order: about.cards.length,
    };
    about.cards.push(newCard);
    await about.save();
    res.status(201).json(newCard);
  } catch (error) {
    res.status(400).json({ message: 'Card creation failed', error: error.message });
  }
});

// Update card
router.put('/cards/:cardId', async (req, res) => {
  try {
    const about = await About.findOne();
    const card = about.cards.id(req.params.cardId);
    if (!card) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }
    Object.assign(card, req.body);
    await about.save();
    res.json(card);
  } catch (error) {
    res.status(400).json({ message: 'Card update failed', error: error.message });
  }
});

// Delete card
router.delete('/cards/:cardId', async (req, res) => {
  try {
    const about = await About.findOne();
    about.cards.id(req.params.cardId).deleteOne();
    await about.save();
    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Card delete failed', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const SocialMedia = require('../models/SocialMedia');

const router = express.Router();

// Get social media links
router.get('/', async (req, res) => {
  try {
    let social = await SocialMedia.findOne();
    if (!social) {
      social = await SocialMedia.create({});
    }
    res.json(social);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load social media links', error: error.message });
  }
});

// Update social media links
router.put('/', async (req, res) => {
  try {
    let social = await SocialMedia.findOne();
    if (!social) {
      social = await SocialMedia.create(req.body);
    } else {
      Object.assign(social, req.body);
      await social.save();
    }
    res.json(social);
  } catch (error) {
    res.status(400).json({ message: 'Social media update failed', error: error.message });
  }
});

module.exports = router;

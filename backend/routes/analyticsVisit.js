const express = require('express');
const Settings = require('../models/Settings');

const router = express.Router();

router.post('/visit', async (req, res) => {
  try {
    await Settings.findOneAndUpdate({}, { $inc: { 'stats.siteVisits': 1 } }, { upsert: true, new: true });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: 'Visit tracking failed', error: error.message });
  }
});

module.exports = router;

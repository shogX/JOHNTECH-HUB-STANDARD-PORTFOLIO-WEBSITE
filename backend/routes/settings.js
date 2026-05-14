const express = require('express');
const Settings = require('../models/Settings');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function flattenPatch(obj, prefix = '') {
  const out = {};
  if (!obj || typeof obj !== 'object') return out;
  Object.entries(obj).forEach(([k, v]) => {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      Object.assign(out, flattenPatch(v, p));
    } else {
      out[p] = v;
    }
  });
  return out;
}

router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load settings', error: error.message });
  }
});

router.put('/', requireAuth, async (req, res) => {
  try {
    const patch = flattenPatch(req.body || {});
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    await Settings.updateOne({ _id: settings._id }, { $set: patch });
    const fresh = await Settings.findById(settings._id);
    res.json(fresh);
  } catch (error) {
    res.status(400).json({ message: 'Settings update failed', error: error.message });
  }
});

module.exports = router;

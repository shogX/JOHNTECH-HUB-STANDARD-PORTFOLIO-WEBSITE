const express = require('express');
const jwt = require('jsonwebtoken');
const Settings = require('../models/Settings');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const secret = process.env.JWT_SECRET;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!secret || !adminPassword) {
      return res.status(503).json({
        message: 'Auth is not configured. Set JWT_SECRET and ADMIN_PASSWORD in your .env file.',
      });
    }

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const adminEmail = (settings.adminProfile && settings.adminProfile.email) || process.env.ADMIN_EMAIL || 'admin@johntechhub.com';
    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ sub: adminEmail, role: 'admin' }, secret, { expiresIn: '7d' });
    return res.json({
      token,
      user: {
        email: adminEmail,
        displayName: settings.adminProfile?.displayName || 'Admin',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;

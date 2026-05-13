const express = require('express');
const Footer = require('../models/Footer');

const router = express.Router();

// Get footer data
router.get('/', async (req, res) => {
  try {
    let footer = await Footer.findOne();
    if (!footer) {
      footer = await Footer.create({});
    }
    res.json(footer);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load footer data', error: error.message });
  }
});

// Update footer basic info
router.put('/', async (req, res) => {
  try {
    let footer = await Footer.findOne();
    if (!footer) {
      footer = await Footer.create(req.body);
    } else {
      const { logo, description, copyrightText } = req.body;
      footer.logo = logo || footer.logo;
      footer.description = description || footer.description;
      footer.copyrightText = copyrightText || footer.copyrightText;
      await footer.save();
    }
    res.json(footer);
  } catch (error) {
    res.status(400).json({ message: 'Footer update failed', error: error.message });
  }
});

// Add footer link
router.post('/links', async (req, res) => {
  try {
    const footer = await Footer.findOne();
    const newLink = {
      _id: new require('mongoose').Types.ObjectId(),
      ...req.body,
      order: footer.links.length,
    };
    footer.links.push(newLink);
    await footer.save();
    res.status(201).json(newLink);
  } catch (error) {
    res.status(400).json({ message: 'Link creation failed', error: error.message });
  }
});

// Update footer link
router.put('/links/:linkId', async (req, res) => {
  try {
    const footer = await Footer.findOne();
    const link = footer.links.id(req.params.linkId);
    if (!link) {
      res.status(404).json({ message: 'Link not found' });
      return;
    }
    Object.assign(link, req.body);
    await footer.save();
    res.json(link);
  } catch (error) {
    res.status(400).json({ message: 'Link update failed', error: error.message });
  }
});

// Delete footer link
router.delete('/links/:linkId', async (req, res) => {
  try {
    const footer = await Footer.findOne();
    footer.links.id(req.params.linkId).deleteOne();
    await footer.save();
    res.json({ message: 'Link deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Link delete failed', error: error.message });
  }
});

module.exports = router;

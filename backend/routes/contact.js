const express = require('express');
const Contact = require('../models/Contact');

const router = express.Router();

// Get contact info
router.get('/info', async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = await Contact.create({});
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load contact info', error: error.message });
  }
});

// Update contact info
router.put('/info', async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = await Contact.create(req.body);
    } else {
      const { email, phone, whatsapp, address, location, contactFormText } = req.body;
      contact.email = email || contact.email;
      contact.phone = phone || contact.phone;
      contact.whatsapp = whatsapp || contact.whatsapp;
      contact.address = address || contact.address;
      contact.location = location || contact.location;
      contact.contactFormText = contactFormText || contact.contactFormText;
      await contact.save();
    }
    res.json(contact);
  } catch (error) {
    res.status(400).json({ message: 'Contact info update failed', error: error.message });
  }
});

// Get messages
router.get('/messages', async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = await Contact.create({});
    }
    res.json(contact.messages || []);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load messages', error: error.message });
  }
});

// Add message (from contact form on frontend)
router.post('/messages', async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = await Contact.create({});
    }
    const newMessage = {
      _id: new require('mongoose').Types.ObjectId(),
      ...req.body,
      createdAt: new Date(),
    };
    contact.messages.push(newMessage);
    await contact.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: 'Message creation failed', error: error.message });
  }
});

// Mark message as read
router.put('/messages/:messageId/read', async (req, res) => {
  try {
    const contact = await Contact.findOne();
    const message = contact.messages.id(req.params.messageId);
    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }
    message.read = true;
    await contact.save();
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: 'Failed to mark as read', error: error.message });
  }
});

// Delete message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const contact = await Contact.findOne();
    contact.messages.id(req.params.messageId).deleteOne();
    await contact.save();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Message delete failed', error: error.message });
  }
});

module.exports = router;

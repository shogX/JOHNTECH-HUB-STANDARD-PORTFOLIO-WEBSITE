const express = require('express');
const Message = require('../models/Message');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

async function sendAdminNotification(doc) {
  const host = process.env.SMTP_HOST;
  if (!host) return;

  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch {
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });

  const to = process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
  if (!to) return;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || to,
    to,
    subject: doc.subject ? `Portfolio message: ${doc.subject}` : 'New portfolio message',
    text: `From: ${doc.name} <${doc.email}>\n\n${doc.message}`,
  });
}

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const newMessage = new Message({
      name,
      email,
      subject,
      message,
    });

    const savedMessage = await newMessage.save();

    try {
      await sendAdminNotification(savedMessage);
    } catch (mailErr) {
      console.warn('Email notification skipped:', mailErr.message);
    }

    return res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error submitting message:', error);
    return res.status(500).json({ message: 'Failed to submit message', error: error.message });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Error fetching message', error: error.message });
  }
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update message', error: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message', error: error.message });
  }
});

module.exports = router;

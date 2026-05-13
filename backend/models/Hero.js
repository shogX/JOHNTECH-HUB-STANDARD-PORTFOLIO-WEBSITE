const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema(
  {
    mainHeading: { type: String, default: 'Hi, I\'m John' },
    nameText: { type: String, default: 'JOHN' },
    introText: { type: String, default: 'Full-Stack Developer | UI/UX Designer' },
    description: { type: String, default: 'Building innovative digital experiences...' },
    heroImage: { type: String, default: '' },
    resumeFile: { type: String, default: '' },
    primaryButtonText: { type: String, default: 'Download Resume' },
    primaryButtonLink: { type: String, default: '#' },
    secondaryButtonText: { type: String, default: 'View My Work' },
    secondaryButtonLink: { type: String, default: '#portfolio' },
    floatingTags: { type: [String], default: ['React', 'Node.js', 'UI Design'] },
    backgroundEffect: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hero', heroSchema);

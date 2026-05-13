const mongoose = require('mongoose');

const footerSchema = new mongoose.Schema(
  {
    logo: { type: String, default: '' },
    description: { type: String, default: '' },
    copyrightText: { type: String, default: '© 2026 JOHNTECH HUB. All rights reserved.' },
    links: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        label: String,
        href: String,
        order: Number,
      },
    ],
    socialIcons: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        platform: String, // 'github', 'linkedin', 'twitter', etc.
        url: String,
        icon: String, // icon class
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Footer', footerSchema);

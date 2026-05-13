const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema(
  {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SocialMedia', socialMediaSchema);

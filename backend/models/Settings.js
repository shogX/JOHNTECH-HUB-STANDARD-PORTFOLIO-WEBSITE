const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    // Site info
    siteTitle: { type: String, default: 'JOHNTECH HUB' },
    siteDescription: { type: String, default: '' },
    favicon: { type: String, default: '' },
    logo: { type: String, default: '' },
    
    // Theme
    primaryColor: { type: String, default: '#8b5cf6' },
    secondaryColor: { type: String, default: '#ec4899' },
    darkMode: { type: Boolean, default: true },
    
    // SEO
    metaDescription: { type: String, default: '' },
    metaKeywords: { type: String, default: '' },
    googleAnalyticsId: { type: String, default: '' },
    
    // Section visibility
    sections: {
      hero: { type: Boolean, default: true },
      about: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      portfolio: { type: Boolean, default: true },
      services: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
      footer: { type: Boolean, default: true },
    },
    
    // Section order (for homepage reordering)
    sectionOrder: {
      type: [String],
      default: ['hero', 'about', 'skills', 'portfolio', 'services', 'contact', 'footer'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);

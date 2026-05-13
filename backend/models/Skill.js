const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    category: { type: String, required: true }, // 'frontend', 'backend', 'design'
    title: { type: String, required: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    icon: { type: String, default: '' },
    color: { type: String, default: '#8b5cf6' },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);

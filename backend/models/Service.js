const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'code' }, // Store SVG name or path
  features: { type: [String], default: [] },
  colorType: { type: String, enum: ['purple', 'pink'], default: 'purple' },
  buttonLink: { type: String, default: '#' },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 } // Added for potential reordering
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
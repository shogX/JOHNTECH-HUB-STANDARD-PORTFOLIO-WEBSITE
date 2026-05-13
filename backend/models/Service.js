const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    icon: { type: String, required: true }, // icon class or URL
    title: { type: String, required: true },
    description: { type: String, required: true },
    features: { type: [String], default: [] },
    buttonText: { type: String, default: 'Learn More' },
    buttonLink: { type: String, default: '#' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);

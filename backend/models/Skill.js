const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    category: {
      type: String,
      enum: ['Development', 'UI/UX Design', 'Frameworks & Tools'],
      required: true,
    },
    colorType: { type: String, enum: ['purple', 'pink'], default: 'purple' },
    icon: { type: String, default: 'code' },
    animationMs: { type: Number, default: 900, min: 100, max: 5000 },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);

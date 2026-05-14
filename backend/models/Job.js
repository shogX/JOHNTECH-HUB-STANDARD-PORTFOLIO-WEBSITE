const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'Web Development',
    },
    link: {
      type: String,
      trim: true,
    },
    githubUrl: { type: String, trim: true, default: '' },
    liveUrl: { type: String, trim: true, default: '' },
    technologies: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    gallery: { type: [String], default: [] },
    featured: {
      type: Boolean,
      default: false,
    },
    order: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    postedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);

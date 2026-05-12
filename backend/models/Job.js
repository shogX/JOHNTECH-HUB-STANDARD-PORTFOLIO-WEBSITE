const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
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
  image: {
    type: String,
    trim: true,
    default: '',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  postedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Job', jobSchema);

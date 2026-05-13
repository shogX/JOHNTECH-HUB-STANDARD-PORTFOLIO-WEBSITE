const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'About Me' },
    mainParagraph: { type: String, default: '' },
    highlightedWords: { type: [String], default: [] },
    experienceText: { type: String, default: '' },
    techStack: { type: [String], default: [] },
    cards: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        icon: String,
        title: String,
        description: String,
        order: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('About', aboutSchema);

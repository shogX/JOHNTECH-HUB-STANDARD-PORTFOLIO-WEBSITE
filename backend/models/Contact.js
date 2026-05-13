const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    // Contact info
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    address: { type: String, default: '' },
    location: { type: String, default: '' },
    contactFormText: { type: String, default: 'Get in touch with me!' },
    
    // Messages from contact form
    messages: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String,
        message: String,
        read: { type: Boolean, default: false },
        replied: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);

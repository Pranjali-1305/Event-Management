const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    club_id: { type: mongoose.Schema.Types.ObjectId, ref: 'clubs', required: true },
    image_url: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('events', eventSchema);

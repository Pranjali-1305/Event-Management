const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'events', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate registrations
registrationSchema.index({ event_id: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('registrations', registrationSchema);

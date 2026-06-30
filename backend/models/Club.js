const mongoose = require('mongoose');

const tentativeDateSchema = new mongoose.Schema({
  label: { type: String, required: true },
  date: { type: Date, required: true },
});

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    logo_url: { type: String, required: true },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'admins' },
    tentative_dates: { type: [tentativeDateSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('clubs', clubSchema);

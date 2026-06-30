const Registration = require('../models/Registration');
const Event = require('../models/Event');

const createRegistration = async (req, res) => {
  try {
    const { event_id, name, email } = req.body;

    if (!event_id || !name || !email) {
      return res.status(400).json({ message: 'event_id, name, and email are required' });
    }

    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registration = await Registration.create({ event_id, name, email });
    res.status(201).json({
      _id: registration._id,
      event_id: registration.event_id,
      name: registration.name,
      email: registration.email,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You are already registered for this event' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAdminRegistrations = async (req, res) => {
  try {
    // Find all events belonging to this admin's club
    const events = await Event.find({ club_id: req.admin.club_id }, '_id');
    const eventIds = events.map((e) => e._id);

    const registrations = await Registration.find({ event_id: { $in: eventIds } })
      .populate('event_id', 'title date');

    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createRegistration, getAdminRegistrations };

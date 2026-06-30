const Event = require('../models/Event');

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('club_id', 'name logo_url')
      .sort({ date: 1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('club_id', 'name logo_url');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, date, location, description, image_url } = req.body;
    if (!title || !date || !location || !description) {
      return res.status(400).json({ message: 'title, date, location, and description are required' });
    }
    const event = await Event.create({
      title,
      date,
      location,
      description,
      image_url,
      club_id: req.admin.club_id,
    });
    const populated = await event.populate('club_id', 'name logo_url');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.club_id.toString() !== req.admin.club_id.toString()) {
      return res.status(403).json({ message: 'Forbidden: you can only update your own club events' });
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('club_id', 'name logo_url');
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.club_id.toString() !== req.admin.club_id.toString()) {
      return res.status(403).json({ message: 'Forbidden: you can only delete your own club events' });
    }
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };

const Club = require('../models/Club');

const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find({}, '_id name logo_url tentative_dates');
    res.status(200).json(clubs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const addTentativeDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, date } = req.body;

    if (!label || !date) {
      return res.status(400).json({ message: 'label and date are required' });
    }

    if (req.admin.club_id.toString() !== id) {
      return res.status(403).json({ message: 'Forbidden: you can only manage your own club' });
    }

    const club = await Club.findByIdAndUpdate(
      id,
      { $push: { tentative_dates: { label, date } } },
      { new: true }
    );

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.status(200).json(club);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteTentativeDate = async (req, res) => {
  try {
    const { id, entryId } = req.params;

    if (req.admin.club_id.toString() !== id) {
      return res.status(403).json({ message: 'Forbidden: you can only manage your own club' });
    }

    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const entry = club.tentative_dates.id(entryId);
    if (!entry) {
      return res.status(404).json({ message: 'Tentative date entry not found' });
    }

    club.tentative_dates.pull({ _id: entryId });
    await club.save();

    res.status(200).json(club);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllClubs, addTentativeDate, deleteTentativeDate };

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Club = require('../models/Club');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const token = jwt.sign(
      { _id: admin._id, club_id: admin.club_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const signup = async (req, res) => {
  try {
    const { username, password, club_id } = req.body;

    if (!username || !password || !club_id) {
      return res.status(400).json({ message: 'username, password, and club_id are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check username is unique
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // Check the club exists
    const club = await Club.findById(club_id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check the club doesn't already have an admin
    const clubHasAdmin = await Admin.findOne({ club_id });
    if (clubHasAdmin) {
      return res.status(409).json({ message: 'This club already has an admin account' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ username, password: hashedPassword, club_id });

    // Link admin to club
    await Club.findByIdAndUpdate(club_id, { admin_id: admin._id });

    const token = jwt.sign(
      { _id: admin._id, club_id: admin.club_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Username already taken' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { login, signup };

const express = require('express');
const router = express.Router();
const { createRegistration, getAdminRegistrations } = require('../controllers/registrationController');
const auth = require('../middleware/auth');

router.post('/register', createRegistration);
router.get('/admin/registrations', auth, getAdminRegistrations);

module.exports = router;

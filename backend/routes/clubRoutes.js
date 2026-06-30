const express = require('express');
const router = express.Router();
const { getAllClubs, addTentativeDate, deleteTentativeDate } = require('../controllers/clubController');
const auth = require('../middleware/auth');

router.get('/', getAllClubs);
router.put('/:id/tentative-dates', auth, addTentativeDate);
router.delete('/:id/tentative-dates/:entryId', auth, deleteTentativeDate);

module.exports = router;

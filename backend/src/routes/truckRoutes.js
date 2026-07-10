const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAvailableTrucks } = require('../controllers/truckController');

const router = express.Router();

// Protect all truck routes
router.use(protect);

// THE NEW ENDPOINT: Only an 'agency' can fetch available trucks
router.get('/available', authorize('agency'), getAvailableTrucks);

module.exports = router;
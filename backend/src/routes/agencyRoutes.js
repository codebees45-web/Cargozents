const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getDashboard, getDrivers, addDriver, removeDriver } = require('../controllers/agencyController');

const router = express.Router();

router.use(protect, authorize('agency'));

router.get('/dashboard', getDashboard);
router.get('/drivers', getDrivers);
router.post('/drivers', addDriver);
router.delete('/drivers/:id', removeDriver);

module.exports = router;
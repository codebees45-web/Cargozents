const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboard,
  getDrivers,
  addDriver,
  removeDriver,
  getTrucks,
  addTruck,
  updateTruck,
  deleteTruck,
} = require('../controllers/agencyController');

const router = express.Router();

router.use(protect, authorize('agency'));

router.get('/dashboard', getDashboard);
router.get('/drivers', getDrivers);
router.post('/drivers', addDriver);
router.delete('/drivers/:id', removeDriver);

router.get('/trucks', getTrucks);
router.post('/trucks', addTruck);
router.patch('/trucks/:id', updateTruck);
router.delete('/trucks/:id', deleteTruck);

module.exports = router;
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAllComplaints, resolveComplaint } = require('../controllers/complaintController');
const {
  getDrivers,
  verifyDriver,
  suspendDriver,
  getVehicles,
  verifyVehicle,
  getDocuments,
  reviewDocument,
  getShipments,
  getAnalyticsOverview,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/drivers', getDrivers);
router.patch('/drivers/:id/verify', verifyDriver);
router.patch('/drivers/:id/suspend', suspendDriver);

router.get('/vehicles', getVehicles);
router.patch('/vehicles/:id/verify', verifyVehicle);

router.get('/documents', getDocuments);
router.patch('/documents/:id/review', reviewDocument);

router.get('/shipments', getShipments);

router.get('/analytics/overview', getAnalyticsOverview);

module.exports = router;

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Document = require('../models/Document');
const Shipment = require('../models/Shipment');

/** GET /api/admin/drivers?approved=false */
const getDrivers = async (req, res, next) => {
  try {
    const { approved } = req.query;
    const filter = { role: 'driver' };
    if (approved !== undefined) filter.isApproved = approved === 'true';

    const drivers = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, drivers });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/drivers/:id/verify — Body: { isApproved: boolean } */
const verifyDriver = async (req, res, next) => {
  try {
    const driver = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'driver' },
      { isApproved: !!req.body.isApproved },
      { new: true }
    );
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.status(200).json({ success: true, driver });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/drivers/:id/suspend — Body: { isSuspended: boolean } */
const suspendDriver = async (req, res, next) => {
  try {
    const driver = await User.findByIdAndUpdate(req.params.id, { isSuspended: !!req.body.isSuspended }, { new: true });
    if (!driver) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, driver });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/vehicles?verified=false */
const getVehicles = async (req, res, next) => {
  try {
    const { verified } = req.query;
    const filter = {};
    if (verified !== undefined) filter.isVerified = verified === 'true';

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 }).populate('driver', 'name phone');
    res.status(200).json({ success: true, vehicles });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/vehicles/:id/verify — Body: { isVerified: boolean } */
const verifyVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { isVerified: !!req.body.isVerified }, { new: true });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.status(200).json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/documents?status=pending */
const getDocuments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const documents = await Document.find(filter)
      .sort({ createdAt: -1 })
      .populate('owner', 'name phone role')
      .populate('vehicle', 'registrationNumber type');
    res.status(200).json({ success: true, documents });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/documents/:id/review
 * Body: { status: 'approved' | 'rejected', rejectionReason? }
 */
const reviewDocument = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "status must be 'approved' or 'rejected'" });
    }

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason: status === 'rejected' ? rejectionReason || '' : '', reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    res.status(200).json({ success: true, document });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/shipments?status=requested */
const getShipments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const shipments = await Shipment.find(filter)
      .sort({ createdAt: -1 })
      .populate('shipper', 'name phone')
      .populate('assignedDriver', 'name phone');
    res.status(200).json({ success: true, shipments });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/analytics/overview
 * All figures computed live from the database — nothing hardcoded.
 */
const getAnalyticsOverview = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      todaysRevenueAgg,
      totalRevenueAgg,
      activeShipments,
      pendingVerifications,
      backhaulAgg,
      statusBreakdown,
    ] = await Promise.all([
      Shipment.aggregate([
        { $match: { status: 'delivered', updatedAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$finalPrice' } } },
      ]),
      Shipment.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$finalPrice' } } },
      ]),
      Shipment.countDocuments({ status: { $in: ['assigned', 'accepted', 'picked_up', 'in_transit'] } }),
      Document.countDocuments({ status: 'pending' }),
      Shipment.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: '$isBackhaulMatch', count: { $sum: 1 } } },
      ]),
      Shipment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const backhaulDelivered = backhaulAgg.find((b) => b._id === true)?.count || 0;
    const totalDelivered = backhaulAgg.reduce((sum, b) => sum + b.count, 0);

    res.status(200).json({
      success: true,
      analytics: {
        todaysRevenue: todaysRevenueAgg[0]?.total || 0,
        totalRevenue: totalRevenueAgg[0]?.total || 0,
        activeShipments,
        pendingVerifications,
        backhaulMatchesDelivered: backhaulDelivered,
        totalDelivered,
        backhaulMatchRate: totalDelivered ? Number(((backhaulDelivered / totalDelivered) * 100).toFixed(1)) : 0,
        statusBreakdown: statusBreakdown.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDrivers,
  verifyDriver,
  suspendDriver,
  getVehicles,
  verifyVehicle,
  getDocuments,
  reviewDocument,
  getShipments,
  getAnalyticsOverview,
};

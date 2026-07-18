const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Document = require('../models/Document');
const Shipment = require('../models/Shipment');

/** GET /api/admin/drivers?approved=false */
const getDrivers = async (req, res, next) => {
  try {
    const { approved } = req.query;
    const filter = { role: 'driver' };
    if (approved !== undefined) {
      filter.isApproved = approved === 'true';
    }

    const drivers = await User.find(filter).select('-password -otp').sort({ createdAt: -1 });

    res.status(200).json({ success: true, drivers });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/drivers/:id/verify — Body: { isApproved: boolean } */
const verifyDriver = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const driver = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'driver' },
      { isApproved: !!isApproved },
      { new: true }
    ).select('-password -otp');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json({ success: true, driver });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/drivers/:id/suspend — Body: { isSuspended: boolean } */
const suspendDriver = async (req, res, next) => {
  try {
    const { isSuspended } = req.body;
    const driver = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: !!isSuspended },
      { new: true }
    ).select('-password -otp');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
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
    if (verified !== undefined) {
      filter.isVerified = verified === 'true';
    }

    const vehicles = await Vehicle.find(filter)
      .populate('driver', 'name phone')
      .populate('agency', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, vehicles });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/vehicles/:id/verify — Body: { isVerified: boolean } */
const verifyVehicle = async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { isVerified: !!isVerified },
      { new: true }
    ).populate('driver', 'name phone').populate('agency', 'name phone');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
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
      .populate('owner', 'name phone role')
      .populate('vehicle', 'registrationNumber type')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, documents });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/documents/:id/review */
const reviewDocument = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "status must be 'approved' or 'rejected'" });
    }

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason || '' : '',
        reviewedBy: req.user?._id || null,
        reviewedAt: new Date(),
      },
      { new: true }
    )
      .populate('owner', 'name phone role')
      .populate('vehicle', 'registrationNumber type');

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
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
      .populate('shipper', 'name phone')
      .populate('assignedDriver', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, shipments });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/analytics/overview */
const getAnalyticsOverview = async (req, res, next) => {
  try {
    const metrics = {
      todaysRevenue: 0,
      totalRevenue: 0,
      activeShipments: 0,
      pendingVerifications: 0,
      backhaulMatchesDelivered: 0,
      totalDelivered: 0,
      backhaulMatchRate: 0,
      statusBreakdown: { requested: 0, assigned: 0, in_transit: 0, delivered: 0 },
    };

    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [
        totalRevenueAgg,
        todaysRevenueAgg,
        activeShipments,
        pendingVerifications,
        totalDelivered,
        backhaulDelivered,
        statusCounts,
      ] = await Promise.all([
        Shipment.aggregate([
          { $match: { status: 'delivered' } },
          { $group: { _id: null, total: { $sum: { $ifNull: ['$finalPrice', 0] } } } },
        ]),
        Shipment.aggregate([
          { $match: { status: 'delivered', updatedAt: { $gte: startOfToday } } },
          { $group: { _id: null, total: { $sum: { $ifNull: ['$finalPrice', 0] } } } },
        ]),
        Shipment.countDocuments({ status: { $in: ['assigned', 'accepted', 'picked_up', 'in_transit'] } }),
        Document.countDocuments({ status: 'pending' }),
        Shipment.countDocuments({ status: 'delivered' }),
        Shipment.countDocuments({ status: 'delivered', isBackhaulMatch: true }),
        Shipment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      ]);

      metrics.totalRevenue = totalRevenueAgg[0]?.total || 0;
      metrics.todaysRevenue = todaysRevenueAgg[0]?.total || 0;
      metrics.activeShipments = activeShipments;
      metrics.pendingVerifications = pendingVerifications;
      metrics.totalDelivered = totalDelivered;
      metrics.backhaulMatchesDelivered = backhaulDelivered;
      metrics.backhaulMatchRate = totalDelivered > 0 ? Number(((backhaulDelivered / totalDelivered) * 100).toFixed(1)) : 0;

      statusCounts.forEach(({ _id, count }) => {
        if (_id in metrics.statusBreakdown) {
          metrics.statusBreakdown[_id] = count;
        }
      });
    } catch (dbErr) {
      console.log('Analytics aggregation query notice — using interface defaults:', dbErr.message);
    }

    res.status(200).json({ success: true, analytics: metrics });
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/analytics/trend?days=14 — daily revenue & delivery counts for charting */
const getAnalyticsTrend = async (req, res, next) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 14, 1), 90);

    let trend = [];
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);
      since.setHours(0, 0, 0, 0);

      const result = await Shipment.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            revenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'delivered'] }, { $ifNull: ['$finalPrice', 0] }, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      trend = result.map((r) => ({
        day: r._id,
        delivered: r.delivered || 0,
        revenue: r.revenue || 0,
      }));
    } catch (dbErr) {
      console.log('Analytics trend query notice — returning empty trend:', dbErr.message);
    }

    res.status(200).json({ success: true, trend });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/drivers/bulk-verify — Body: { ids: string[], isApproved: boolean } */
const bulkVerifyDrivers = async (req, res, next) => {
  try {
    const { ids, isApproved } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids must be a non-empty array' });
    }

    await User.updateMany({ _id: { $in: ids }, role: 'driver' }, { isApproved: !!isApproved });
    const drivers = await User.find({ _id: { $in: ids }, role: 'driver' }).select('-password -otp');

    res.status(200).json({ success: true, drivers });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/vehicles/bulk-verify — Body: { ids: string[], isVerified: boolean } */
const bulkVerifyVehicles = async (req, res, next) => {
  try {
    const { ids, isVerified } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids must be a non-empty array' });
    }

    await Vehicle.updateMany({ _id: { $in: ids } }, { isVerified: !!isVerified });
    const vehicles = await Vehicle.find({ _id: { $in: ids } })
      .populate('driver', 'name phone')
      .populate('agency', 'name phone');

    res.status(200).json({ success: true, vehicles });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/admin/documents/bulk-review — Body: { ids: string[], status: 'approved'|'rejected' } */
const bulkReviewDocuments = async (req, res, next) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids must be a non-empty array' });
    }
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "status must be 'approved' or 'rejected'" });
    }

    await Document.updateMany(
      { _id: { $in: ids } },
      { status, reviewedBy: req.user?._id || null, reviewedAt: new Date() }
    );
    const documents = await Document.find({ _id: { $in: ids } }).select('_id status');

    res.status(200).json({ success: true, documents });
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
  getAnalyticsTrend,
  bulkVerifyDrivers,
  bulkVerifyVehicles,
  bulkReviewDocuments,
};
const Shipment = require('../models/Shipment');
const Vehicle = require('../models/Vehicle');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { calculatePrice } = require('../utils/pricingEngine');
const { findMatches } = require('../utils/matchingEngine');

/**
 * POST /api/shipments
 * Shipper posts a new shipment (manual posting or from a fulfilled Order).
 */
const createShipment = async (req, res, next) => {
  try {
    const {
      order,
      goodsType,
      weight,
      volume,
      vehicleRequired,
      pickup,
      drop,
      scheduledDate,
      scheduledTime,
      specialInstructions,
      insuranceOpted,
      deliveryPaidBy,
    } = req.body;

    if (!goodsType || !weight || !vehicleRequired || !pickup || !drop || !scheduledDate) {
      return res.status(400).json({ success: false, message: 'Missing required shipment fields' });
    }

    let linkedOrder = null;
    if (order) {
      linkedOrder = await Order.findOne({ _id: order, shipper: req.user._id });
      if (!linkedOrder) {
        return res.status(404).json({ success: false, message: 'Order not found for this shipper' });
      }
      if (linkedOrder.shipment) {
        return res.status(400).json({ success: false, message: 'This order already has a shipment' });
      }
    }

    const { estimatedPrice, distanceKm, breakdown } = calculatePrice({
      pickupCoordinates: pickup.location.coordinates,
      dropCoordinates: drop.location.coordinates,
      pickupState: pickup.state,
      dropState: drop.state,
      weight,
      vehicleType: vehicleRequired,
      insuranceOpted,
    });

    const shipment = await Shipment.create({
      shipper: req.user._id,
      order: order || null,
      source: order ? 'order' : 'manual',
      goodsType,
      weight,
      volume,
      vehicleRequired,
      pickup,
      drop,
      scheduledDate,
      scheduledTime,
      specialInstructions,
      insuranceOpted: !!insuranceOpted,
      deliveryPaidBy: deliveryPaidBy || 'shipper',
      estimatedPrice,
      trackingHistory: [{ status: 'requested', timestamp: new Date() }],
    });

    if (linkedOrder) {
      linkedOrder.shipment = shipment._id;
      linkedOrder.status = 'shipment_requested';
      await linkedOrder.save();
    }

    res.status(201).json({ success: true, shipment, priceBreakdown: breakdown, distanceKm });
  } catch (err) {
    next(err);
  }
};

/** GET /api/shipments/mine — shipper's own shipments */
const getMyShipments = async (req, res, next) => {
  try {
    const shipments = await Shipment.find({ shipper: req.user._id })
      .sort({ createdAt: -1 })
      .populate('assignedDriver', 'name phone driverProfile.rating')
      .populate('assignedVehicle', 'registrationNumber type');

    // Mark which delivered shipments this shipper has already reviewed so
    // the UI can show "Rate driver" only where it's still actionable.
    const reviewedIds = new Set(
      (await Review.find({ reviewer: req.user._id, shipment: { $ne: null } }, 'shipment')).map((r) =>
        r.shipment.toString()
      )
    );
    const shipmentsWithReviewFlag = shipments.map((s) => ({
      ...s.toObject(),
      hasReview: reviewedIds.has(s._id.toString()),
    }));

    res.status(200).json({ success: true, shipments: shipmentsWithReviewFlag });
  } catch (err) {
    next(err);
  }
};

/** GET /api/shipments/assigned-to-me — driver's assigned/active loads */
const getAssignedShipments = async (req, res, next) => {
  try {
    const shipments = await Shipment.find({ assignedDriver: req.user._id })
      .sort({ createdAt: -1 })
      .populate('shipper', 'name phone');
    res.status(200).json({ success: true, shipments });
  } catch (err) {
    next(err);
  }
};

/** GET /api/shipments/:id — detail, visible to shipper, assigned driver, or admin */
const getShipmentById = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('shipper', 'name phone')
      .populate('assignedDriver', 'name phone driverProfile.rating')
      .populate('assignedVehicle', 'registrationNumber type');

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    const isOwner = shipment.shipper._id.equals(req.user._id);
    const isAssignedDriver = shipment.assignedDriver && shipment.assignedDriver._id.equals(req.user._id);
    if (!isOwner && !isAssignedDriver && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this shipment' });
    }

    res.status(200).json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/shipments/:id/respond
 * Driver accepts or rejects an assigned load.
 * Body: { accept: boolean }
 */
const respondToAssignment = async (req, res, next) => {
  try {
    const { accept } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
    if (!shipment.assignedDriver || !shipment.assignedDriver.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'This shipment is not assigned to you' });
    }
    if (shipment.status !== 'assigned') {
      return res.status(400).json({ success: false, message: `Shipment is already '${shipment.status}'` });
    }

    if (accept) {
      shipment.status = 'accepted';
      shipment.trackingHistory.push({ status: 'accepted', timestamp: new Date() });

      // Vehicle is now committed to this load, so it's no longer "on empty
      // return" — that state resumes only after this delivery completes.
      await Vehicle.findByIdAndUpdate(shipment.assignedVehicle, {
        isOnEmptyReturn: false,
        emptyReturnSince: null,
      });
    } else {
      shipment.status = 'rejected';
      shipment.trackingHistory.push({ status: 'rejected', timestamp: new Date() });
      shipment.assignedDriver = null;
      shipment.assignedVehicle = null;
      shipment.assignedAt = null;
      // Falls back to 'requested' so it re-enters the admin assignment queue.
      shipment.status = 'requested';
    }

    await shipment.save();
    res.status(200).json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
};

const NEXT_STATUS = {
  accepted: 'picked_up',
  picked_up: 'in_transit',
  in_transit: 'delivered',
};

/**
 * PATCH /api/shipments/:id/status
 * Driver advances shipment through its delivery lifecycle.
 * Body: { coordinates?: [lng, lat] }
 */
const advanceShipmentStatus = async (req, res, next) => {
  try {
    const { coordinates } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
    if (!shipment.assignedDriver || !shipment.assignedDriver.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'This shipment is not assigned to you' });
    }

    const next_ = NEXT_STATUS[shipment.status];
    if (!next_) {
      return res.status(400).json({ success: false, message: `Cannot advance shipment from status '${shipment.status}'` });
    }

    shipment.status = next_;
    shipment.trackingHistory.push({
      status: next_,
      location: coordinates ? { type: 'Point', coordinates } : undefined,
      timestamp: new Date(),
    });

    if (next_ === 'delivered') {
      // Delivery complete — the vehicle is now empty. Flip it back to
      // "on empty return" so the matching engine can offer it a backhaul
      // load on its way home, closing the loop this whole product exists for.
      await Vehicle.findByIdAndUpdate(shipment.assignedVehicle, {
        isOnEmptyReturn: true,
        emptyReturnSince: new Date(),
        ...(coordinates && { currentLocation: { type: 'Point', coordinates } }),
      });
    } else if (coordinates) {
      await Vehicle.findByIdAndUpdate(shipment.assignedVehicle, {
        currentLocation: { type: 'Point', coordinates },
      });
    }

    await shipment.save();
    res.status(200).json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
};

/** GET /api/shipments/:id/matches — admin: ranked candidate drivers for this shipment */
const getMatchesForShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
    if (shipment.status !== 'requested') {
      return res.status(400).json({ success: false, message: 'Shipment already has an assignment' });
    }

    const matches = await findMatches(shipment);
    res.status(200).json({
      success: true,
      matches: matches.map((m) => ({
        vehicleId: m.vehicle._id,
        registrationNumber: m.vehicle.registrationNumber,
        driver: { id: m.driver._id, name: m.driver.name, phone: m.driver.phone, rating: m.driver.driverProfile?.rating },
        distanceToPickupKm: m.distanceToPickupKm,
        etaMinutes: m.etaMinutes,
        isBackhaulMatch: m.isBackhaulMatch,
        priorityScore: m.priorityScore,
        scoreBreakdown: m.scoreBreakdown,
      })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/shipments/:id/assign — admin assigns a driver+vehicle.
 * Body: { vehicleId }
 */
const assignShipment = async (req, res, next) => {
  try {
    const { vehicleId } = req.body;
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
    if (shipment.status !== 'requested') {
      return res.status(400).json({ success: false, message: `Shipment is already '${shipment.status}'` });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || !vehicle.isVerified || !vehicle.isActive) {
      return res.status(400).json({ success: false, message: 'Vehicle is not available for assignment' });
    }

    shipment.assignedDriver = vehicle.driver;
    shipment.assignedVehicle = vehicle._id;
    shipment.assignedBy = req.user._id;
    shipment.assignedAt = new Date();
    shipment.status = 'assigned';
    shipment.isBackhaulMatch = vehicle.isOnEmptyReturn;

    // Recompute the final price now that we know if it's a backhaul match
    // (which carries a discount) — the shipper's original quote was an
    // estimate; this is the authoritative price.
    const { estimatedPrice } = calculatePrice({
      pickupCoordinates: shipment.pickup.location.coordinates,
      dropCoordinates: shipment.drop.location.coordinates,
      pickupState: shipment.pickup.state,
      dropState: shipment.drop.state,
      weight: shipment.weight,
      vehicleType: shipment.vehicleRequired,
      insuranceOpted: shipment.insuranceOpted,
      isBackhaulMatch: shipment.isBackhaulMatch,
    });
    shipment.finalPrice = estimatedPrice;

    shipment.trackingHistory.push({ status: 'assigned', timestamp: new Date() });
    await shipment.save();

    res.status(200).json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/shipments/:id/track
 * Live tracking feed for a shipment: pickup/drop points, the assigned
 * vehicle's last-known position, and the full breadcrumb trail. Visible
 * to the shipper who posted it, the assigned driver, an admin, or — since
 * a shipment can originate from a fulfilled Order — the buyer who placed
 * that order.
 */
const getShipmentTracking = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('assignedDriver', 'name phone')
      .populate('assignedVehicle', 'registrationNumber type currentLocation');

    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

    const isOwner = shipment.shipper.equals(req.user._id);
    const isAssignedDriver = shipment.assignedDriver && shipment.assignedDriver._id.equals(req.user._id);
    let isBuyer = false;
    if (!isOwner && !isAssignedDriver && req.user.role === 'buyer' && shipment.order) {
      const order = await Order.findById(shipment.order);
      isBuyer = !!order && order.buyer.equals(req.user._id);
    }
    if (!isOwner && !isAssignedDriver && !isBuyer && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to track this shipment' });
    }

    res.status(200).json({
      success: true,
      tracking: {
        status: shipment.status,
        pickup: shipment.pickup,
        drop: shipment.drop,
        scheduledDate: shipment.scheduledDate,
        driver: shipment.assignedDriver
          ? { name: shipment.assignedDriver.name, phone: shipment.assignedDriver.phone }
          : null,
        vehicle: shipment.assignedVehicle
          ? {
              registrationNumber: shipment.assignedVehicle.registrationNumber,
              type: shipment.assignedVehicle.type,
              currentLocation: shipment.assignedVehicle.currentLocation,
            }
          : null,
        trackingHistory: shipment.trackingHistory,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createShipment,
  getMyShipments,
  getAssignedShipments,
  getShipmentById,
  respondToAssignment,
  advanceShipmentStatus,
  getMatchesForShipment,
  assignShipment,
  getShipmentTracking,
};
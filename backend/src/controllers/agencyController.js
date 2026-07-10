const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

/** GET /api/agency/dashboard — fleet size, availability, rating summary */
const getDashboard = async (req, res, next) => {
  try {
    const drivers = await User.find({ 'driverProfile.agency': req.user._id, role: 'driver' });
    const fleetSize = drivers.length;
    const availableNow = drivers.filter((d) => d.driverProfile?.isAvailable).length;
    const avgRating =
      fleetSize === 0
        ? 0
        : Number(
            (drivers.reduce((sum, d) => sum + (d.driverProfile?.rating || 0), 0) / fleetSize).toFixed(1)
          );

    if (req.user.agencyProfile.fleetSize !== fleetSize) {
      req.user.agencyProfile.fleetSize = fleetSize;
      req.user.markModified('agencyProfile');
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      stats: { fleetSize, availableNow, avgRating },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/agency/drivers — list drivers currently linked to this agency */
const getDrivers = async (req, res, next) => {
  try {
    const drivers = await User.find({ 'driverProfile.agency': req.user._id, role: 'driver' }).select(
      'name email phone driverProfile isApproved isSuspended createdAt'
    );
    res.status(200).json({ success: true, drivers });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/agency/drivers — link an existing driver account to this agency
 * Body: { phone }  — the driver must already be registered on the platform.
 */
const addDriver = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Driver phone number is required' });

    const driver = await User.findOne({ phone, role: 'driver' });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'No driver account found with that phone number' });
    }
    if (driver.driverProfile.agency) {
      return res.status(409).json({ success: false, message: 'This driver already belongs to an agency' });
    }

    driver.driverProfile.agency = req.user._id;
    await driver.save();

    res.status(200).json({ success: true, message: 'Driver added to your fleet', driver });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/agency/drivers/:id — unlink a driver from this agency's fleet */
const removeDriver = async (req, res, next) => {
  try {
    const driver = await User.findOne({ _id: req.params.id, 'driverProfile.agency': req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found in your fleet' });

    driver.driverProfile.agency = null;
    await driver.save();

    res.status(200).json({ success: true, message: 'Driver removed from your fleet' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/agency/vehicles — every vehicle belonging to a driver in this
 * agency's fleet, with enough location state for a tracking list/map.
 * This is the read side of the manual-location fallback: an agency staff
 * member needs to see which vehicles have gone stale/never shared before
 * deciding which ones to update by hand.
 */
const getFleetVehicles = async (req, res, next) => {
  try {
    const driverIds = (await User.find({ 'driverProfile.agency': req.user._id, role: 'driver' }, '_id')).map(
      (d) => d._id
    );
    const vehicles = await Vehicle.find({ driver: { $in: driverIds } })
      .populate('driver', 'name phone')
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, vehicles });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/agency/vehicles/:id/location
 * Body: { coordinates: [lng, lat] }
 *
 * Manual GPS fallback for drivers who have no smartphone and therefore
 * can never run the browser-geolocation flow in
 * frontend/hooks/useLiveLocationSharing.js themselves. Restricted to
 * agency staff updating a vehicle that belongs to a driver in *their own*
 * fleet — an agency can't move another agency's trucks around on the map.
 *
 * Written with locationSource: 'manual' so the tracking UI never claims
 * this is a live GPS feed (formatLocationFreshness renders it distinctly
 * from an actual device ping). If that same vehicle's driver later gets a
 * smartphone and starts using live sharing, updateLocation in
 * driverController overwrites locationSource back to 'gps' automatically
 * — no need to "turn off" manual mode here.
 */
const setVehicleLocation = async (req, res, next) => {
  try {
    const { coordinates } = req.body;
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: 'coordinates must be [lng, lat]' });
    }
    const [lng, lat] = coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number' || Number.isNaN(lng) || Number.isNaN(lat)) {
      return res.status(400).json({ success: false, message: 'coordinates must be numeric [lng, lat]' });
    }

    const driverIds = (await User.find({ 'driverProfile.agency': req.user._id, role: 'driver' }, '_id')).map(
      (d) => d._id.toString()
    );
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle || !driverIds.includes(vehicle.driver.toString())) {
      return res.status(404).json({ success: false, message: 'Vehicle not found in your fleet' });
    }

    const now = new Date();
    vehicle.currentLocation = { type: 'Point', coordinates };
    vehicle.locationUpdatedAt = now;
    vehicle.isSharingLocation = true;
    vehicle.locationSource = 'manual';
    await vehicle.save();

    res.status(200).json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getDrivers, addDriver, removeDriver, getFleetVehicles, setVehicleLocation };
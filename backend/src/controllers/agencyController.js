const User = require('../models/User');

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

module.exports = { getDashboard, getDrivers, addDriver, removeDriver };
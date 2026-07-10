const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['mini_truck', 'tempo', 'container', 'trailer', 'open_body'],
      required: true,
    },
    capacityWeight: { type: Number, required: true }, // kg
    capacityVolume: { type: Number }, // cubic meters

    photos: { type: [String], default: [] }, // Cloudinary URLs

    // A vehicle only becomes bookable once every required document on it
    // (RC, permit, insurance) is admin-approved.
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Live location, mirrored from the driver's device while a trip is
    // active. Kept on Vehicle (not just User) so the matching engine can
    // geo-query vehicles directly by type/capacity/location in one pass.
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    // When currentLocation was last written. Lets the frontend tell a
    // fresh GPS ping apart from a stale one (e.g. driver's app was
    // closed/killed, phone lost signal) instead of showing a dot that
    // silently stops moving with no explanation.
    locationUpdatedAt: { type: Date, default: null },
    // True only while the driver has live sharing switched on for an
    // active trip. Lets shippers/admin distinguish "no GPS yet" from
    // "driver turned sharing off" on the tracking map.
    isSharingLocation: { type: Boolean, default: false },
    // Where currentLocation came from. 'gps' = the driver's own device via
    // PATCH /drivers/location (see driverController.updateLocation).
    // 'manual' = an agency staff member typed/clicked it in for a driver
    // who has no smartphone and therefore can't run that flow themselves
    // (see agencyController.setVehicleLocation). The tracking UI shows
    // these very differently — manual pins never claim to be "live".
    locationSource: { type: String, enum: ['gps', 'manual'], default: 'gps' },

    // True from the moment a driver marks a delivery as "delivered" until
    // they either accept a new load or manually clear it. This is the flag
    // the backhaul matcher looks for — an empty vehicle sitting somewhere,
    // available to be filled instead of driving back empty.
    isOnEmptyReturn: { type: Boolean, default: false },
    emptyReturnSince: { type: Date, default: null },
    // Where the vehicle is headed home/base to, used to score how well a
    // candidate backhaul shipment's route overlaps with this leg.
    homeBaseLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ currentLocation: '2dsphere' });
vehicleSchema.index({ type: 1, isVerified: 1, isActive: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
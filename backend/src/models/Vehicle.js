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

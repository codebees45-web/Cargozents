const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never returned by default queries
    },
    role: {
      type: String,
      enum: ['buyer', 'shipper', 'driver', 'admin'],
      required: true,
      default: 'buyer',
    },

    // Shipper-specific: does this shipper run a product catalog, post raw
    // shipments, or both? Drives which UI/routes are exposed to them.
    shipperMode: {
      type: String,
      enum: ['catalog', 'raw_shipment', 'both'],
      default: undefined, // only relevant when role === 'shipper'
    },
    // Default pickup point for this shipper's warehouse/dispatch point —
    // used to pre-fill the shipment-posting form, especially when a
    // shipment is being created to fulfil a confirmed Order.
    shipperProfile: {
      pickupAddress: {
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
        location: {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: { type: [Number], default: [0, 0] },
        },
      },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      reviewsCount: { type: Number, default: 0 },
    },

    isVerified: {
      type: Boolean,
      default: false, // true once OTP verification is completed — required to log in
    },
    // Distinct from isVerified (OTP completion): this is the admin's manual
    // approval of a driver for the network, based on their document review.
    // Kept as a separate field so admin approve/reject actions never touch
    // the OTP-verification flag that login depends on.
    isApproved: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false },
    },

    // Driver-specific fields kept lightweight here; heavy verification
    // documents live in the separate Document model (one-to-many).
    driverProfile: {
      currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      },
      isAvailable: { type: Boolean, default: false },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      reviewsCount: { type: Number, default: 0 },
    },

    profileImage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Geo index for driver location-based matching (used later by the AI
// matching engine to find nearby available drivers).
userSchema.index({ 'driverProfile.currentLocation': '2dsphere' });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
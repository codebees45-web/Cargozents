const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtPurchase: {
      // snapshot price so later product edits don't rewrite order history
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    shipper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    productTotal: {
      // sum of items — Shipper is paid this amount, separate from delivery
      type: Number,
      required: true,
    },

    deliveryAddress: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      },
    },

    // Product payment status — independent of delivery payment,
    // per the "separate payments" decision.
    productPaymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    productPaymentMethod: {
      type: String,
      enum: ['upi', 'card', 'cod', 'netbanking'],
    },

    // Overall order lifecycle. "awaiting_shipment" means the Shipper has
    // been paid/confirmed but hasn't requested a truck yet.
    status: {
      type: String,
      enum: [
        'placed',
        'confirmed_by_shipper',
        'awaiting_shipment',
        'shipment_requested',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'placed',
    },

    // Set once the Shipper requests a truck for this order — links
    // forward to the freight side of the system.
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.index({ 'deliveryAddress.location': '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);

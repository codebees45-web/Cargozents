const mongoose = require("mongoose");

const trackingEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      default: "",
    },

    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    shipper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    pickup: {
      address: {
        type: String,
        required: true,
      },

      latitude: Number,
      longitude: Number,

      contactName: String,
      contactPhone: String,
    },

    delivery: {
      address: {
        type: String,
        required: true,
      },

      latitude: Number,
      longitude: Number,

      contactName: String,
      contactPhone: String,
    },

    goods: {
      name: {
        type: String,
        required: true,
      },

      category: String,

      quantity: Number,

      weight: Number,

      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },

      fragile: {
        type: Boolean,
        default: false,
      },

      hazardous: {
        type: Boolean,
        default: false,
      },

      refrigerated: {
        type: Boolean,
        default: false,
      },

      stackable: {
        type: Boolean,
        default: true,
      },

      notes: String,
    },

    vehicle: {
      type: {
        type: String,
      },

      capacity: Number,

      registrationNumber: String,
    },

    shipment: {
      deliveryType: {
        type: String,
        enum: [
          "Standard",
          "Express",
          "Same Day",
        ],
        default: "Standard",
      },

      pickupSchedule: Date,

      estimatedDistance: Number,

      estimatedDuration: Number,
    },

    pricing: {
      baseFare: {
        type: Number,
        default: 0,
      },

      distanceCharge: {
        type: Number,
        default: 0,
      },

      fuelCharge: {
        type: Number,
        default: 0,
      },

      tollCharge: {
        type: Number,
        default: 0,
      },

      insuranceCharge: {
        type: Number,
        default: 0,
      },

      gst: {
        type: Number,
        default: 0,
      },

      totalAmount: {
        type: Number,
        default: 0,
      },
    },

    payment:{

        status:String,

        razorpayOrderId:String,

        razorpayPaymentId:String,

        razorpaySignature:String,

        transactionId:String,

        invoiceNumber:String,

        invoiceUrl:String,

        paidAt:Date

        },

    tracking: {
      currentStatus: {
        type: String,
        enum: [
          "Draft",
          "Submitted",
          "Admin Review",
          "Approved",
          "Driver Assigned",
          "Driver Accepted",
          "Pickup Started",
          "Picked Up",
          "In Transit",
          "Reached Destination",
          "Delivered",
          "Completed",
          "Cancelled",
        ],
        default: "Draft",
      },

      timeline: [trackingEventSchema],
    },

    deliveryOTP: {
      code: String,

      verified: {
        type: Boolean,
        default: false,
      },

      expiresAt: Date,
    },

    documents: [documentSchema],

    rating: {
      stars: {
        type: Number,
        min: 1,
        max: 5,
      },

      review: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
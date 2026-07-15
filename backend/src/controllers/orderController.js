const Order = require("../models/Order");
const { v4: uuidv4 } = require("uuid");

/**
 * Create Order
 */
exports.createOrder = async (req, res) => {
  try {
    const orderId = `CGZ-${Date.now()}`;

    const order = await Order.create({
      orderId,
      buyer: req.user._id,

      pickup: req.body.pickup,
      delivery: req.body.delivery,

      goods: req.body.goods,

      vehicle: req.body.vehicle,

      shipment: req.body.shipment,

      pricing: req.body.pricing,

      documents: req.body.documents || [],

      tracking: {
        currentStatus: "Submitted",
        timeline: [
          {
            status: "Submitted",
            message: "Order created successfully",
            createdAt: new Date(),
          },
        ],
      },
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get Logged-in User Orders
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      buyer: req.user._id,
    })
      .populate("driver", "name phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get Order By ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("driver", "name phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/**
 * Cancel Order
 */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.tracking.currentStatus = "Cancelled";

    order.tracking.timeline.push({
      status: "Cancelled",
      message: "Order cancelled by buyer",
      createdAt: new Date(),
    });

    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Update Order Status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.tracking.currentStatus = status;

    order.tracking.timeline.push({
      status,
      message: `Status changed to ${status}`,
      createdAt: new Date(),
    });

    await order.save();

    const io = req.app.get("io");

    if (io) {
      io.to(order._id.toString()).emit("status-update", {
        bookingId: order._id,
        status,
      });
    }

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};/**
 * Cancel Order
 */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.tracking.currentStatus = "Cancelled";

    order.tracking.timeline.push({
      status: "Cancelled",
      message: "Order cancelled by buyer",
      createdAt: new Date(),
    });

    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Update Order Status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.tracking.currentStatus = status;

    order.tracking.timeline.push({
      status,
      message: `Status changed to ${status}`,
      createdAt: new Date(),
    });

    await order.save();

    const io = req.app.get("io");

    if (io) {
      io.to(order._id.toString()).emit("status-update", {
        bookingId: order._id,
        status,
      });
    }

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/**
 * Assign Driver
 */
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.driver = driverId;

    order.tracking.currentStatus = "Driver Assigned";

    order.tracking.timeline.push({
      status: "Driver Assigned",
      message: "Driver assigned successfully",
      createdAt: new Date(),
    });

    await order.save();

    res.json({
      success: true,
      message: "Driver assigned",
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Generate Delivery OTP
 */
exports.generateOTP = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    order.deliveryOTP = {
      code: otp,
      verified: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };

    await order.save();

    res.json({
      success: true,
      otp,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
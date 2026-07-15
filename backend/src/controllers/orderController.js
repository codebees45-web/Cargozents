const Order = require("../models/Order");
const Product = require("../models/Product");

/**
 * Create Order (freight / "Book Shipment" flow)
 */
exports.createOrder = async (req, res) => {
  try {
    const orderId = `CGZ-${Date.now()}`;

    const order = await Order.create({
      orderId,
      buyer: req.user._id,
      orderType: "shipment",

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
 * Create Product Order (Shop / Cart / Checkout flow)
 *
 * Prices and stock are re-read from the database rather than trusted from
 * the client, and all items in the cart must belong to the same shipper
 * (a cart only ever holds one shipper's products at a time on the frontend).
 */
exports.createProductOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, productPaymentMethod } = req.body;

    const productIds = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more products in your cart could not be found",
      });
    }

    const shipperIds = new Set(products.map((p) => p.shipper.toString()));
    if (shipperIds.size > 1) {
      return res.status(400).json({
        success: false,
        message: "All items in an order must be from the same shipper",
      });
    }

    const productsById = new Map(products.map((p) => [p._id.toString(), p]));

    let productTotal = 0;
    const orderItems = [];

    for (const { product: productId, quantity } of items) {
      const product = productsById.get(productId);

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `"${product.name}" is no longer available`,
        });
      }
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} of "${product.name}" left in stock`,
        });
      }

      productTotal += product.price * quantity;
      orderItems.push({
        product: product._id,
        quantity,
        priceAtPurchase: product.price,
      });
    }

    const orderId = `CGZ-${Date.now()}`;

    const order = await Order.create({
      orderId,
      buyer: req.user._id,
      shipper: products[0].shipper,
      orderType: "product",

      items: orderItems,
      productTotal,
      deliveryAddress,
      productPaymentMethod,
      productPaymentStatus: productPaymentMethod === "cod" ? "pending" : "pending",

      status: "placed",
    });

    // Best-effort stock decrement — not wrapped in a transaction since this
    // project doesn't run Mongo as a replica set locally, but good enough
    // for the current single-shipper-per-order flow.
    await Promise.all(
      orderItems.map((i) =>
        Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } })
      )
    );

    const populatedOrder = await Order.findById(order._id).populate(
      "items.product"
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
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
 * Optional ?type=product|shipment query param to filter by order type.
 */
exports.getMyOrders = async (req, res) => {
  try {
    const filter = { buyer: req.user._id };
    if (req.query.type === "product" || req.query.type === "shipment") {
      filter.orderType = req.query.type;
    }

    const orders = await Order.find(filter)
      .populate("driver", "name phone")
      .populate("items.product")
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
      .populate("driver", "name phone")
      .populate("shipper", "name")
      .populate("items.product");

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
 * Cancel Order — works for both shipment and product orders.
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

    if (!order.buyer.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    if (order.orderType === "product") {
      if (["delivered", "cancelled"].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Order already ${order.status}`,
        });
      }
      order.status = "cancelled";
    } else {
      order.tracking.currentStatus = "Cancelled";
      order.tracking.timeline.push({
        status: "Cancelled",
        message: "Order cancelled by buyer",
        createdAt: new Date(),
      });
    }

    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
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
 * Update Order Status (shipment orders — driver/admin/shipper actions)
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

    if (order.orderType === "product") {
      order.status = status;
    } else {
      order.tracking.currentStatus = status;
      order.tracking.timeline.push({
        status,
        message: `Status changed to ${status}`,
        createdAt: new Date(),
      });
    }

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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

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
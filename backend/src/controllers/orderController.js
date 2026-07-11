const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');

/**
 * POST /api/orders
 * Buyer places an order. All items must belong to the same shipper (one
 * order = one shipper's catalog), matching how a single Shipment will
 * later be requested to deliver it.
 * Body: { items: [{ product, quantity }], deliveryAddress, productPaymentMethod }
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, productPaymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'items and deliveryAddress are required' });
    }

    const products = await Product.find({ _id: { $in: items.map((i) => i.product) }, isActive: true });
    if (products.length !== items.length) {
      return res.status(400).json({ success: false, message: 'One or more products are unavailable' });
    }

    const shipperIds = new Set(products.map((p) => p.shipper.toString()));
    if (shipperIds.size > 1) {
      return res.status(400).json({ success: false, message: 'All items in one order must be from the same shipper' });
    }

    let productTotal = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.product);
      productTotal += product.price * item.quantity;
      return { product: product._id, quantity: item.quantity, priceAtPurchase: product.price };
    });

    // Atomically claim stock: each update only succeeds if enough stock is
    // still available at the moment it runs, closing the check-then-write
    // race where two concurrent orders could both pass a separate check.
    const stockUpdates = await Promise.all(
      orderItems.map((item) =>
        Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        )
      )
    );

    const failedIndex = stockUpdates.findIndex((updated) => !updated);
    if (failedIndex !== -1) {
      // Roll back any stock we did manage to claim before hitting the one
      // that failed, then report which product ran out.
      await Promise.all(
        stockUpdates
          .map((updated, i) => (updated ? Product.findByIdAndUpdate(orderItems[i].product, { $inc: { stock: orderItems[i].quantity } }) : null))
          .filter(Boolean)
      );
      const failedProduct = products.find((p) => p._id.toString() === orderItems[failedIndex].product.toString());
      return res.status(400).json({ success: false, message: `Insufficient stock for ${failedProduct?.name || 'a product in your order'}` });
    }

    const order = await Order.create({
      buyer: req.user._id,
      shipper: products[0].shipper,
      items: orderItems,
      productTotal,
      deliveryAddress,
      productPaymentMethod: productPaymentMethod || 'cod',
      // Both COD and prepaid orders start 'pending' until a payment-capture
      // flow (e.g. a Razorpay webhook) actually marks this 'paid'/'failed'.
      productPaymentStatus: 'pending',
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/mine — buyer's own orders */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 }).populate('items.product', 'name images');

    // Mark which delivered orders this buyer has already reviewed so the
    // UI can show "Rate shipper" only where it's still actionable.
    const reviewedIds = new Set(
      (await Review.find({ reviewer: req.user._id, order: { $ne: null } }, 'order')).map((r) => r.order.toString())
    );
    const ordersWithReviewFlag = orders.map((o) => ({
      ...o.toObject(),
      hasReview: reviewedIds.has(o._id.toString()),
    }));

    res.status(200).json({ success: true, orders: ordersWithReviewFlag });
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/received — shipper's incoming orders */
const getReceivedOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ shipper: req.user._id }).sort({ createdAt: -1 }).populate('buyer', 'name phone').populate('items.product', 'name');
    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/orders/:id/confirm — shipper confirms an order is ready,
 * moving it into the queue to have a shipment requested against it.
 */
const confirmOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, shipper: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'placed') {
      return res.status(400).json({ success: false, message: `Order is already '${order.status}'` });
    }

    order.status = 'confirmed_by_shipper';
    await order.save();
    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/:id — visible to the buyer who placed it or the shipper who received it */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name phone')
      .populate('items.product', 'name weightPerUnit');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isBuyer = order.buyer._id.equals(req.user._id);
    const isShipper = order.shipper.equals(req.user._id);
    if (!isBuyer && !isShipper && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getReceivedOrders, confirmOrder, getOrderById };
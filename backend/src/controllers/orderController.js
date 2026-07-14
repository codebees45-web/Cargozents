const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');

/**
 * POST /api/orders
 * Buyer places an order
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, productPaymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'items and deliveryAddress are required',
      });
    }

    const products = await Product.find({
      _id: { $in: items.map((i) => i.product) },
      isActive: true,
    });

    if (products.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products are unavailable',
      });
    }

    const shipperIds = new Set(
      products.map((p) => p.shipper.toString())
    );

    if (shipperIds.size > 1) {
      return res.status(400).json({
        success: false,
        message: 'All items must belong to the same shipper',
      });
    }

    let productTotal = 0;

    const orderItems = items.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.product
      );

      productTotal += product.price * item.quantity;

      return {
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      };
    });


    // Reduce stock safely
    const stockUpdates = await Promise.all(
      orderItems.map((item) =>
        Product.findOneAndUpdate(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          {
            new: true,
          }
        )
      )
    );


    const failedIndex = stockUpdates.findIndex(
      (item) => !item
    );


    if (failedIndex !== -1) {

      await Promise.all(
        stockUpdates
          .map((updated, index) =>
            updated
              ? Product.findByIdAndUpdate(
                  orderItems[index].product,
                  {
                    $inc: {
                      stock: orderItems[index].quantity,
                    },
                  }
                )
              : null
          )
          .filter(Boolean)
      );


      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }


    const order = await Order.create({
      buyer: req.user._id,
      shipper: products[0].shipper,
      items: orderItems,
      productTotal,
      deliveryAddress,
      productPaymentMethod:
        productPaymentMethod || 'cod',
      productPaymentStatus: 'pending',
    });


    res.status(201).json({
      success: true,
      order,
    });

  } catch (err) {
    next(err);
  }
};



/**
 * GET /api/orders/mine
 * Buyer's own orders
 */
const getMyOrders = async (req, res, next) => {
  try {

    const orders = await Order.find({
      buyer: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate(
        'items.product',
        'name images unit weightPerUnit stock isActive'
      )
      .populate(
        'shipper',
        'name'
      );


    const reviewedIds = new Set(
      (
        await Review.find(
          {
            reviewer: req.user._id,
            order: { $ne: null },
          },
          'order'
        )
      ).map((r) => r.order.toString())
    );


    const ordersWithReviewFlag = orders.map(
      (order) => ({
        ...order.toObject(),
        hasReview: reviewedIds.has(
          order._id.toString()
        ),
      })
    );


    res.status(200).json({
      success: true,
      orders: ordersWithReviewFlag,
    });


  } catch (err) {
    next(err);
  }
};




/**
 * GET /api/orders/received
 * Shipper received orders
 */
const getReceivedOrders = async (req, res, next) => {
  try {

    const orders = await Order.find({
      shipper: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate(
        'buyer',
        'name phone'
      )
      .populate(
        'items.product',
        'name'
      );


    res.status(200).json({
      success: true,
      orders,
    });


  } catch (err) {
    next(err);
  }
};




/**
 * PATCH /api/orders/:id/confirm
 * Shipper confirms order
 */
const confirmOrder = async (req, res, next) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      shipper: req.user._id,
    });


    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }


    if (order.status !== 'placed') {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.status}`,
      });
    }


    order.status = 'confirmed_by_shipper';

    await order.save();


    res.status(200).json({
      success: true,
      order,
    });


  } catch (err) {
    next(err);
  }
};





/**
 * GET /api/orders/:id
 * Buyer or shipper can view order
 */
const getOrderById = async (req, res, next) => {
  try {

    const order = await Order.findById(req.params.id)
      .populate(
        'buyer',
        'name phone'
      )
      .populate(
        'items.product',
        'name weightPerUnit'
      );


    if (!order) {
      return res.status(404).json({
        success:false,
        message:'Order not found',
      });
    }


    const isBuyer =
      order.buyer._id.equals(req.user._id);

    const isShipper =
      order.shipper.equals(req.user._id);


    if (
      !isBuyer &&
      !isShipper &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success:false,
        message:'Not authorized',
      });
    }


    res.status(200).json({
      success:true,
      order,
    });


  } catch(err) {
    next(err);
  }
};



module.exports = {
  createOrder,
  getMyOrders,
  getReceivedOrders,
  confirmOrder,
  getOrderById,
};
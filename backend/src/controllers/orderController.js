const { pgQuery, withTransaction } = require('../config/postgres');
const User = require('../models/User');
const Review = require('../models/Review');
const mapOrderRow = require('../utils/mapOrderRow');
const mapProductRow = require('../utils/mapProductRow');
const crypto = require('crypto');

/** Batched MongoDB lookup for { _id, name, phone } across a set of user ids. */
const getUsersInfo = async (userIds, fields = 'name') => {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map();
  const users = await User.find({ _id: { $in: uniqueIds } }).select(fields);
  const map = new Map();
  users.forEach((u) => {
    map.set(
      u._id.toString(),
      fields.includes('phone') ? { _id: u._id, name: u.name, phone: u.phone } : { _id: u._id, name: u.name }
    );
  });
  return map;
};

/** Fetches order_items rows for a set of order ids, joined with their product row. */
const getItemsForOrders = async (orderIds, productFields = null) => {
  if (orderIds.length === 0) return new Map();
  const result = await pgQuery(
    `SELECT oi.order_id, oi.quantity, oi.price_at_purchase, p.*
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ANY($1)`,
    [orderIds]
  );

  const byOrder = new Map();
  result.rows.forEach((row) => {
    const productObj = productFields
      ? pickFields(mapProductRow(row), productFields)
      : mapProductRow(row);

    const item = {
      product: productObj,
      quantity: row.quantity,
      price_at_purchase: row.price_at_purchase,
    };
    if (!byOrder.has(row.order_id)) byOrder.set(row.order_id, []);
    byOrder.get(row.order_id).push(item);
  });
  return byOrder;
};

/** Trims a mapped product object down to just the fields Mongoose's .populate(..., 'name images') used to select. */
const pickFields = (product, fields) => {
  const picked = { _id: product._id };
  fields.forEach((f) => {
    if (product[f] !== undefined) picked[f] = product[f];
  });
  return picked;
};

/**
 * POST /api/orders
 * Buyer places an order. All items must belong to the same shipper.
 * Body: { items: [{ product, quantity }], deliveryAddress, productPaymentMethod }
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, productPaymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'items and deliveryAddress are required' });
    }

    const productIds = items.map((i) => i.product);
    const productsResult = await pgQuery(
      `SELECT * FROM products WHERE id = ANY($1) AND is_active = true`,
      [productIds]
    );
    const products = productsResult.rows;

    if (products.length !== items.length) {
      return res.status(400).json({ success: false, message: 'One or more products are unavailable' });
    }

    const shipperIds = new Set(products.map((p) => p.shipper_id));
    if (shipperIds.size > 1) {
      return res.status(400).json({ success: false, message: 'All items in one order must be from the same shipper' });
    }

    let productTotal = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product);
      productTotal += Number(product.price) * item.quantity;
      return { product: product.id, quantity: item.quantity, priceAtPurchase: Number(product.price) };
    });

    const orderId = crypto.randomBytes(12).toString('hex');
    const shipperId = products[0].shipper_id;

    const order = await withTransaction(async (client) => {
      for (const item of orderItems) {
        const stockUpdate = await client.query(
          `UPDATE products SET stock = stock - $1, updated_at = NOW()
           WHERE id = $2 AND stock >= $1
           RETURNING id`,
          [item.quantity, item.product]
        );
        if (stockUpdate.rows.length === 0) {
          const failedProduct = products.find((p) => p.id === item.product);
          const err = new Error(`Insufficient stock for ${failedProduct?.name || 'a product in your order'}`);
          err.statusCode = 400;
          throw err;
        }
      }

      const orderResult = await client.query(
        `INSERT INTO orders
          (id, buyer_id, shipper_id, product_total,
           delivery_line1, delivery_city, delivery_state, delivery_pincode, delivery_lng, delivery_lat,
           product_payment_status, product_payment_method, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11, 'placed')
         RETURNING *`,
        [
          orderId,
          req.user._id.toString(),
          shipperId,
          productTotal,
          deliveryAddress.line1,
          deliveryAddress.city,
          deliveryAddress.state,
          deliveryAddress.pincode,
          deliveryAddress.location?.coordinates?.[0] || 0,
          deliveryAddress.location?.coordinates?.[1] || 0,
          productPaymentMethod || 'cod',
        ]
      );

      for (const item of orderItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.product, item.quantity, item.priceAtPurchase]
        );
      }

      return orderResult.rows[0];
    });

    const itemsMap = await getItemsForOrders([orderId]);
    const mappedOrder = mapOrderRow(order, itemsMap.get(orderId) || [], req.user._id.toString(), shipperId);

    res.status(201).json({ success: true, order: mappedOrder });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/** GET /api/orders/mine — buyer's own orders */
const getMyOrders = async (req, res, next) => {
  try {
    const result = await pgQuery(
      'SELECT * FROM orders WHERE buyer_id = $1 ORDER BY created_at DESC',
      [req.user._id.toString()]
    );
    const orderIds = result.rows.map((r) => r.id);
    const itemsMap = await getItemsForOrders(orderIds, ['name', 'images']);

    const reviewedIds = new Set(
      (await Review.find({ reviewer: req.user._id, order: { $ne: null } }, 'order')).map((r) => r.order.toString())
    );

    const orders = result.rows.map((row) => ({
      ...mapOrderRow(row, itemsMap.get(row.id) || [], req.user._id.toString(), row.shipper_id),
      hasReview: reviewedIds.has(row.id),
    }));

    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/received — shipper's incoming orders */
const getReceivedOrders = async (req, res, next) => {
  try {
    const result = await pgQuery(
      'SELECT * FROM orders WHERE shipper_id = $1 ORDER BY created_at DESC',
      [req.user._id.toString()]
    );
    const orderIds = result.rows.map((r) => r.id);
    const itemsMap = await getItemsForOrders(orderIds, ['name']);
    const buyerMap = await getUsersInfo(result.rows.map((r) => r.buyer_id), 'name phone');

    const orders = result.rows.map((row) =>
      mapOrderRow(
        row,
        itemsMap.get(row.id) || [],
        buyerMap.get(row.buyer_id) || row.buyer_id,
        req.user._id.toString()
      )
    );

    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/orders/:id/confirm */
const confirmOrder = async (req, res, next) => {
  try {
    const existing = await pgQuery('SELECT * FROM orders WHERE id = $1 AND shipper_id = $2', [
      req.params.id,
      req.user._id.toString(),
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (existing.rows[0].status !== 'placed') {
      return res.status(400).json({ success: false, message: `Order is already '${existing.rows[0].status}'` });
    }

    const result = await pgQuery(
      `UPDATE orders SET status = 'confirmed_by_shipper', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    const itemsMap = await getItemsForOrders([req.params.id]);
    const order = mapOrderRow(result.rows[0], itemsMap.get(req.params.id) || [], result.rows[0].buyer_id, req.user._id.toString());

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/:id */
const getOrderById = async (req, res, next) => {
  try {
    const result = await pgQuery('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const row = result.rows[0];

    const isBuyer = row.buyer_id === req.user._id.toString();
    const isShipper = row.shipper_id === req.user._id.toString();
    if (!isBuyer && !isShipper && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    const itemsMap = await getItemsForOrders([row.id], ['name', 'weightPerUnit']);
    const buyerMap = await getUsersInfo([row.buyer_id], 'name phone');

    const order = mapOrderRow(
      row,
      itemsMap.get(row.id) || [],
      buyerMap.get(row.buyer_id) || row.buyer_id,
      row.shipper_id
    );

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getReceivedOrders, confirmOrder, getOrderById };
const { pgQuery } = require('../config/postgres');
const User = require('../models/User');
const mapProductRow = require('../utils/mapProductRow');
const crypto = require('crypto');

/**
 * Fetches { _id, name } (and optionally phone) for a set of shipper IDs
 * from MongoDB in one batched query, returned as a Map keyed by id string.
 * Mirrors what .populate('shipper', 'name') used to do automatically.
 */
const getShippersInfo = async (shipperIds, fields = 'name') => {
  const uniqueIds = [...new Set(shipperIds)];
  const shippers = await User.find({ _id: { $in: uniqueIds } }).select(fields);
  const map = new Map();
  shippers.forEach((s) => {
    map.set(s._id.toString(), fields.includes('phone') ? { _id: s._id, name: s.name, phone: s.phone } : { _id: s._id, name: s.name });
  });
  return map;
};

/** GET /api/products — public catalog browse, active listings only */
const getProducts = async (req, res, next) => {
  try {
    const { category, shipper } = req.query;

    const whereClauses = ['is_active = true'];
    const values = [];
    let idx = 1;

    if (category) {
      whereClauses.push(`category = $${idx}`);
      values.push(category);
      idx++;
    }
    if (shipper) {
      whereClauses.push(`shipper_id = $${idx}`);
      values.push(shipper);
      idx++;
    }

    const sql = `SELECT * FROM products WHERE ${whereClauses.join(' AND ')} ORDER BY created_at DESC`;
    const result = await pgQuery(sql, values);

    const shipperMap = await getShippersInfo(result.rows.map((r) => r.shipper_id));
    const products = result.rows.map((row) => mapProductRow(row, shipperMap.get(row.shipper_id) || row.shipper_id));

    res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/mine — shipper's own catalog, including inactive items */
const getMyProducts = async (req, res, next) => {
  try {
    const result = await pgQuery(
      'SELECT * FROM products WHERE shipper_id = $1 ORDER BY created_at DESC',
      [req.user._id.toString()]
    );
    const products = result.rows.map((row) => mapProductRow(row));
    res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/:id */
const getProductById = async (req, res, next) => {
  try {
    const result = await pgQuery('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const row = result.rows[0];
    const shipperMap = await getShippersInfo([row.shipper_id], 'name phone');
    const product = mapProductRow(row, shipperMap.get(row.shipper_id) || row.shipper_id);

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

/** POST /api/products — shipper creates a catalog item */
const createProduct = async (req, res, next) => {
  try {
    if (!['catalog', 'both'].includes(req.user.shipperMode)) {
      return res.status(403).json({ success: false, message: 'Your account is not set up for catalog selling' });
    }

    const { name, description, category, price, unit, stock, images, weightPerUnit } = req.body;
    if (!name || !description || !category || price === undefined || !weightPerUnit) {
      return res.status(400).json({ success: false, message: 'Missing required product fields' });
    }

    const id = crypto.randomBytes(12).toString('hex'); // 24-char hex string, same shape as a Mongo ObjectId

    const result = await pgQuery(
      `INSERT INTO products (id, shipper_id, name, description, category, price, unit, stock, images, weight_per_unit, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
       RETURNING *`,
      [
        id,
        req.user._id.toString(),
        name,
        description,
        category,
        price,
        unit || 'unit',
        stock || 0,
        images || [],
        weightPerUnit,
      ]
    );

    const product = mapProductRow(result.rows[0], { _id: req.user._id, name: req.user.name });

    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/products/:id — shipper updates their own product */
const updateProduct = async (req, res, next) => {
  try {
    const existing = await pgQuery('SELECT * FROM products WHERE id = $1 AND shipper_id = $2', [
      req.params.id,
      req.user._id.toString(),
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const current = existing.rows[0];
    const b = req.body;

    const result = await pgQuery(
      `UPDATE products SET
         name = $1, description = $2, category = $3, price = $4, unit = $5,
         stock = $6, images = $7, weight_per_unit = $8, is_active = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        b.name ?? current.name,
        b.description ?? current.description,
        b.category ?? current.category,
        b.price ?? current.price,
        b.unit ?? current.unit,
        b.stock ?? current.stock,
        b.images ?? current.images,
        b.weightPerUnit ?? current.weight_per_unit,
        b.isActive ?? current.is_active,
        req.params.id,
      ]
    );

    const product = mapProductRow(result.rows[0], { _id: req.user._id, name: req.user.name });

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/products/:id — soft delete (deactivate) */
const deleteProduct = async (req, res, next) => {
  try {
    const result = await pgQuery(
      `UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1 AND shipper_id = $2 RETURNING id`,
      [req.params.id, req.user._id.toString()]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product removed from catalog' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getMyProducts, getProductById, createProduct, updateProduct, deleteProduct };
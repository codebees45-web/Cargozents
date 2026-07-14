const { query } = require('../config/db');
const bcrypt = require('bcrypt');

const ALLOWED_TABLE = 'shipments';

const ALLOWED_SORT_COLUMNS = [
  'id',
  'tracking_number',
  'shipper_name',
  'pickup_city',
  'drop_city',
  'status',
  'revenue',
  'created_at',
];

const ALLOWED_FILTER_COLUMNS = [
  'shipper_name',
  'pickup_city',
  'drop_city',
  'status',
];

/**
 * POST /api/signup
 * Handles secure user registration within the custom database (Supabase)
 */
const registerUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // 1. Check if user already exists
    const checkUserQuery = 'SELECT id FROM users WHERE email = $1';
    const existingUser = await query(checkUserQuery, [email]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    // 2. Hash the user password safely
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Insert user into Supabase custom DB
    const insertUserQuery = `
      INSERT INTO users (email, password_hash, role, status, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, email, role, status;
    `;
    
    const userRole = role || 'customer';
    const userStatus = 'active';

    const newUser = await query(insertUserQuery, [email, passwordHash, userRole, userStatus]);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      user: newUser.rows[0]
    });

  } catch (error) {
    next(error);
  }
};
/**
 * POST /api/auth/login
 * Handles secure user authentication against Supabase
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validation check
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // 2. Look for the user inside your Supabase users table
    const findUserQuery = 'SELECT * FROM users WHERE email = $1';
    const result = await query(findUserQuery, [email]);

    // If no rows come back, the email doesn't exist
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // 3. Compare the typed password with the hashed password in Supabase
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // 4. Generate a JWT Token for the frontend session
    let token = 'mock-token-fallback';
    try {
      const jwt = require('jsonwebtoken');
      token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '1d' }
      );
    } catch (jwtError) {
      console.log("jsonwebtoken module not found, using a fallback token string.");
    }

    // 5. Send back a clean success response that matches your frontend layout
    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: token,
      user: {
        id: user.id,
        _id: user.id,                  // 🚀 Compatibility: Feeds frontend if it expects MongoDB '_id'
        email: user.email,
        name: email.split('@')[0],    // 🚀 Compatibility: Generates a temporary name so frontend layout doesn't crash
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/shipments
 * Query params: page, limit, sortBy, order, search, status, etc.
 */
const getAll = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 20;
    if (page < 1) page = 1;
    if (limit < 1) limit = 20;
    if (limit > 100) limit = 100;
    const offset = (page - 1) * limit;

    let sortBy = req.query.sortBy || 'created_at';
    if (!ALLOWED_SORT_COLUMNS.includes(sortBy)) {
      sortBy = 'created_at';
    }

    let order = (req.query.order || 'DESC').toUpperCase();
    if (order !== 'ASC' && order !== 'DESC') {
      order = 'DESC';
    }

    const whereClauses = [];
    const values = [];
    let paramIndex = 1;

    if (req.query.search) {
      whereClauses.push(
        `(tracking_number ILIKE $${paramIndex} OR shipper_name ILIKE $${paramIndex} OR pickup_city ILIKE $${paramIndex} OR drop_city ILIKE $${paramIndex})`
      );
      values.push(`%${req.query.search}%`);
      paramIndex++;
    }

    for (const column of ALLOWED_FILTER_COLUMNS) {
      if (req.query[column]) {
        whereClauses.push(`${column} = $${paramIndex}`);
        values.push(req.query[column]);
        paramIndex++;
      }
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSQL = `SELECT COUNT(*) FROM ${ALLOWED_TABLE} ${whereSQL}`;
    const countResult = await query(countSQL, values);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    const dataSQL = `
      SELECT * FROM ${ALLOWED_TABLE}
      ${whereSQL}
      ORDER BY ${sortBy} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataValues = [...values, limit, offset];
    const dataResult = await query(dataSQL, dataValues);

    res.status(200).json({
      success: true,
      data: dataResult.rows,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/shipments/:id
 */
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(`SELECT * FROM ${ALLOWED_TABLE} WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/shipments/stats/summary
 */
const getStats = async (req, res, next) => {
  try {
    const totalsSQL = `
      SELECT
        COUNT(*) AS total_shipments,
        COALESCE(SUM(revenue), 0) AS total_revenue,
        COALESCE(AVG(revenue), 0) AS average_revenue
      FROM ${ALLOWED_TABLE}
    `;
    const totalsResult = await query(totalsSQL);

    const byStatusSQL = `
      SELECT
        status,
        COUNT(*) AS count,
        COALESCE(SUM(revenue), 0) AS revenue
      FROM ${ALLOWED_TABLE}
      GROUP BY status
      ORDER BY status
    `;
    const byStatusResult = await query(byStatusSQL);

    const topShippersSQL = `
      SELECT
        shipper_name,
        COUNT(*) AS shipment_count,
        COALESCE(SUM(revenue), 0) AS total_revenue
      FROM ${ALLOWED_TABLE}
      GROUP BY shipper_name
      ORDER BY total_revenue DESC
      LIMIT 5
    `;
    const topShippersResult = await query(topShippersSQL);

    res.status(200).json({
      success: true,
      data: {
        totalShipments: parseInt(totalsResult.rows[0].total_shipments, 10),
        totalRevenue: parseFloat(totalsResult.rows[0].total_revenue),
        averageRevenue: parseFloat(totalsResult.rows[0].average_revenue),
        byStatus: byStatusResult.rows.map((row) => ({
          status: row.status,
          count: parseInt(row.count, 10),
          revenue: parseFloat(row.revenue),
        })),
        topShippers: topShippersResult.rows.map((row) => ({
          shipperName: row.shipper_name,
          shipmentCount: parseInt(row.shipment_count, 10),
          totalRevenue: parseFloat(row.total_revenue),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/shipments
 */
const createOne = async (req, res, next) => {
  try {
    const { tracking_number, shipper_name, pickup_city, drop_city, status, revenue } = req.body;

    if (!tracking_number || !shipper_name || !pickup_city || !drop_city) {
      return res.status(400).json({
        success: false,
        message: 'tracking_number, shipper_name, pickup_city, and drop_city are required',
      });
    }

    const insertSQL = `
      INSERT INTO ${ALLOWED_TABLE} (tracking_number, shipper_name, pickup_city, drop_city, status, revenue)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      tracking_number,
      shipper_name,
      pickup_city,
      drop_city,
      status || 'requested',
      revenue || 0,
    ];

    const result = await query(insertSQL, values);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'A shipment with this tracking_number already exists' });
    }
    next(err);
  }
};

/**
 * PUT /api/shipments/:id
 */
const updateOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tracking_number, shipper_name, pickup_city, drop_city, status, revenue } = req.body;

    const existing = await query(`SELECT * FROM ${ALLOWED_TABLE} WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    const current = existing.rows[0];

    const updateSQL = `
      UPDATE ${ALLOWED_TABLE}
      SET tracking_number = $1,
          shipper_name = $2,
          pickup_city = $3,
          drop_city = $4,
          status = $5,
          revenue = $6
      WHERE id = $7
      RETURNING *
    `;
    const values = [
      tracking_number ?? current.tracking_number,
      shipper_name ?? current.shipper_name,
      pickup_city ?? current.pickup_city,
      drop_city ?? current.drop_city,
      status ?? current.status,
      revenue ?? current.revenue,
      id,
    ];

    const result = await query(updateSQL, values);

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'A shipment with this tracking_number already exists' });
    }
    next(err);
  }
};

/**
 * DELETE /api/shipments/:id
 */
const deleteOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(`DELETE FROM ${ALLOWED_TABLE} WHERE id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    res.status(200).json({ success: true, message: 'Shipment deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  getAll, 
  getOne, 
  getStats, 
  createOne, 
  updateOne, 
  deleteOne,
  registerUser,
  loginUser
};
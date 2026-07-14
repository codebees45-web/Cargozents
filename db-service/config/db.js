// db-service/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DATABASE_URL.includes('sslmode=require') || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

pool.on('connect', () => {
  console.log('[DB] New client connected to PostgreSQL pool');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
  process.exit(-1);
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`[DB] Connected successfully at ${result.rows[0].now}`);
    client.release();
  } catch (err) {
    console.error('[DB] Connection test failed:', err.message);
    process.exit(1);
  }
};

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query, testConnection };
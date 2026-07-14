const { Pool } = require('pg');

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pgPool.on('error', (err) => {
  console.error('[POSTGRES] Unexpected error on idle client', err);
});

const pgQuery = (text, params) => pgPool.query(text, params);

/**
 * Runs `fn` inside a single Postgres transaction. `fn` receives a
 * dedicated client — use it (not pgQuery) for every statement inside the
 * callback so they all share the same transaction. Commits on success,
 * rolls back automatically on any thrown error, and always releases the
 * client back to the pool.
 */
const withTransaction = async (fn) => {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pgPool, pgQuery, withTransaction };
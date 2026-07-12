const axios = require('axios');

const dbWrapper = axios.create({
  baseURL: process.env.DB_WRAPPER_URL || 'http://localhost:6000',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

dbWrapper.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `[DB_WRAPPER] ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`
      );
    } else {
      console.error(`[DB_WRAPPER] Request failed - ${error.message}`);
    }
    return Promise.reject(error);
  }
);

module.exports = dbWrapper;